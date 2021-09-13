const axios = require('axios');
const getNFLPlayers = require('../../features/nflplayer/services/getNFLPlayers.service');
const { rediskeys, set, client } = require('../../db/redis');

const yahooStatMap = {
  r: 'rushing',
  w: 'receiving',
  q: 'passing',
  // z: 'defense',
  // n: 'punting',
  x: 'returning',
  k: 'kicking',
  o: 'fumbles',
  f: 'defense',
  // t: 'offense total',
};
const validStatLetters = Object.keys(yahooStatMap);

const multiplierTable = {
  q: [0, 0, 0, 0.04, 4, -1],
  r: [0, 0.1, 6],
  w: [0.5, 0.1, 6],
  x: [0, 0, 6, 2],
  o: [0, -2, 6],
  k: [3, 3, 3, 4, 5, 0, 0, 0, 0, 0, 1],
  f: [0, 1, 2, 2, 6, 2, 2, 0, 6],
};

const playerIDMap = {};
const IDPlayerMap = {};
const teamIDMap = {
  27: 30,
  6: 9,
  1: 2,
  21: 24,
  23: 25,
  2: 4,
  4: 7,
  16: 18,
  8: 11,
  25: 27,
  10: 1,
  22: 31,
  11: 14,
  26: 28,
  24: 26,
  28: 32,
  20: 22,
  29: 5,
  34: 13,
  30: 15,
  5: 8,
  12: 16,
  17: 19,
  15: 17,
  9: 12,
  18: 20,
  7: 10,
  19: 21,
  3: 6,
  14: 29,
  33: 3,
  13: 23,
};

let playerTeamMap = {};

const statObj = {};
const timeObj = {};
let preProjObj = {};

async function init() {
  playerTeamMap = await createPTMap();
  preProjObj = await pullPreProj();
}

function repeat() {
  return PullAllGames().then(PullAllStats).then(GetNewStats).then(CalcValues)
    .then(SetValues)
    // eslint-disable-next-line no-console
    .then(() => console.log('Done'));
}

init().then(repeat).then(() => setInterval(repeat, 10000));

// Populate the playerTeamMap
function createPTMap() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'm'))
    .then((playerlines) => playerlines.reduce((acc, line) => {
      const terms = line.split('|');
      const playerID = terms[1];
      const teamID = terms[2];
      const name = `${terms[4]} ${terms[5]}`;
      playerIDMap[playerID] = name;
      acc[playerID] = teamID;
      return acc;
    }, {}));
}

function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce((acc, p) => {
    IDPlayerMap[p.name] = p.id;
    acc[p.id] = p.preprice;
    return acc;
  }, {}));
}

function PullAllGames() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then((gamelines) => {
      gamelines.forEach((gameline) => {
        const terms = gameline.split('|');
        const team1 = terms[2];
        const team2 = terms[3];
        // const gameState = terms[4]; // F finished, P playing, S not started yet
        const quarter = Number(terms[6]);
        const time = terms[7].split(':');
        const timeElapsed = (
          (quarter - 1) * 15 * 60)
          + ((15 - 5 * (quarter === 5)) * 60 - Number(time[0]) * 60 + Number(time[1])
          );
        const timefrac = timeElapsed / ((60 * 60) + (10 * 60 * (quarter === 5)));
        timeObj[team1] = timefrac;
        timeObj[team2] = timefrac;
      });
    });
}

// Get all latest statlines
function PullAllStats() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
    .then((raw) => raw.data.split('\n'))
    .then((lines) => lines.filter(StatType));
}

function StatType(line) {
  return (validStatLetters.indexOf(line[0]) > -1) ? line[0] : false;
}
// Find changes since last time
function GetNewStats(lines) {
  const newlines = lines.filter(UpdateStats);
  return newlines;
}

function UpdateStats(line) {
  const terms = line.split('|');
  const stattype = terms[0];
  const playerid = terms[1];
  terms.shift();
  terms.shift();
  const statline = terms.join('|');
  if (!statObj[playerid]) statObj[playerid] = {};
  const diff = (!statObj[playerid][stattype] || statObj[playerid][stattype] !== statline);
  statObj[playerid][stattype] = statline;
  return diff;
}

// Set new prices
function CalcValues(newlines) {
  // eslint-disable-next-line no-param-reassign
  let playersToCalc = newlines.map((l) => l.split('|')[1]);
  if (!playersToCalc) { playersToCalc = Object.keys(statObj); }
  return playersToCalc.map(CalcPlayer).filter((e) => e !== false);
}

function CalcPlayer(playerid) {
  const stats = statObj[playerid];
  const statpoints = Math.round(100 * (SumPoints(stats)));
  const projpoints = EstimateProjection(playerid, statpoints);
  const dbid = (IDPlayerMap[playerIDMap[playerid]] || teamIDMap[playerid] || 0);
  if (!dbid) return false;
  return [dbid, statpoints, projpoints];
}

function SumPoints(pstats) {
  const categories = Object.keys(pstats);
  return categories.reduce((accPoints, curCat) => {
    let newPoints = accPoints;
    const line = pstats[curCat].split('|');
    const multipliers = (multiplierTable[curCat] || []);
    // eslint-disable-next-line no-param-reassign
    newPoints += line.reduce((accStatPoints, val, lineIndex) => {
      // eslint-disable-next-line no-param-reassign
      accStatPoints += Number(val) * (multipliers[lineIndex] || 0);
      return accStatPoints;
    }, 0);
    if (curCat === 'f') {
      const pointsAllowed = Number(line[0]);
      if (pointsAllowed === 0) {
        newPoints += 10;
      } else if (pointsAllowed < 7) {
        newPoints += 7;
      } else if (pointsAllowed < 14) {
        newPoints += 4;
      } else if (pointsAllowed < 21) {
        newPoints += 1;
      } else if (pointsAllowed < 28) {
        newPoints += 0;
      } else if (pointsAllowed < 35) {
        newPoints += -1;
      } else {
        newPoints += -4;
      }
    }
    return newPoints;
  }, 0);
}

function EstimateProjection(playerid, statpoints) {
  // Find player's team
  const teamID = (playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = timeObj[teamID];
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (IDPlayerMap[playerIDMap[playerid]] || teamIDMap[playerid] || 0);
  return statpoints + (1 - timefrac) * (preProjObj[dbid] || 0) * (1 - 2 * isDefense);
  // Calculate and return
}

function SetValues(playerVals) {
  const allPromises = playerVals.map((pv) => {
    client.publish('statUpdate', JSON.stringify({
      nflplayerID: pv[0],
      statPrice: Number(pv[1]),
      projPrice: Number(pv[2]),
    }));
    return set.hkey(
      rediskeys.statHash(pv[0]),
      'statPrice', pv[1],
      'projPrice', pv[2],
    );
  });
  return Promise.all(allPromises);
}
