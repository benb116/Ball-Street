/*

Output - stat price updates, projprice updates

state:
  statobj
  gametimeobj
  pointobj
  projpointobj

Input - stat file, player file, game file, initprojections

Statloop:
compare to statobj
find all new lines
calculate new point values for players
pull latest gametime info
calculate new projvalues
set new redisvals and publish

Gameloop:
compare to gametimeobj
find all new lines
calculate new projvalues
set new redisvals and publish

*/

const axios = require('axios');

const yahooStatMap = {
  r: 'rushing',
  w: 'receiving',
  q: 'passing',
  // z: 'defense',
  // n: 'punting',
  x: 'returning',
  k: 'kicking',
  o: 'fumbles',
  f: 'defense I think',
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

// const playerIDMap = {};
// const teamIDMap = {};

let playerTeamMap = {};

const statObj = {};
const timeObj = {};
const preProjObj = {};

async function init() {
  playerTeamMap = await createPTMap();
  // eslint-disable-next-line no-console
  PullAllGames().then(PullAllStats).then(GetNewStats).then(CalcValues)
    .then(console.log);
}

init();

// Populate the playerTeamMap
function createPTMap() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'm'))
    .then((playerlines) => playerlines.reduce((acc, line) => {
      const terms = line.split('|');
      const playerID = terms[1];
      const teamID = terms[2];
      acc[playerID] = teamID;
      return acc;
    }, {}));
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
  playersToCalc.forEach(CalcPlayer);
}

function CalcPlayer(playerid) {
  const stats = statObj[playerid];
  const statpoints = Math.round(100 * (SumPoints(stats))) / 100;
  const projpoints = EstimateProjection(playerid, statpoints);
  console.log([playerid, statpoints, projpoints]);
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
  const teamID = playerTeamMap[playerid];
  // Find time remaining
  const timefrac = timeObj[teamID];
  // is Defense
  const isDefense = (playerid < 40);

  return statpoints + (1 - timefrac) * (preProjObj[playerid] || 0) * (1 - 2 * isDefense);
  // Calculate and return
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
