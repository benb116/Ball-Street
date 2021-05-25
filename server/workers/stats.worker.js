const { promisify } = require('util');
const axios = require('axios');

// const config = require('../config');
const { sportsdataio } = require('../secret');

// Two clients - one to subscribe, one to read and write
const { client, rediskeys } = require('../db/redis');

const hsetAsync = promisify(client.hset).bind(client);

const { NFLPlayer } = require('../models');

// Get projected points before the game
const seasonString = '2020REG';
const weekString = '1';
const projectedURL = `https://fly.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/${seasonString}/${weekString}?key=${sportsdataio}`;
const statURL = `https://fly.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/${seasonString}/${weekString}?key=${sportsdataio}`;

function dbSet() {
  axios.get(projectedURL).then(setDBPrePrices);
  axios.get(statURL).then(setDBStatPrices);
}

function setDBPrePrices({ data }) {
  const all = data.map((p) => {
    const { PlayerID, FantasyPoints } = p;
    return NFLPlayer.update({
      preprice: Math.round(FantasyPoints * 100),
    },
    {
      where: {
        id: PlayerID,
      },
    });
  });
  return Promise.all(all);
}

function setDBStatPrices({ data }) {
  const all = data.map(async (p) => {
    const { PlayerID, FantasyPoints } = p;
    const redisPromise = hsetAsync(rediskeys.statHash(PlayerID), 'projPrice', FantasyPoints);
    const dbPromise = NFLPlayer.update({
      postprice: Math.round(FantasyPoints * 100),
    },
    {
      where: {
        id: PlayerID,
      },
    });
    return Promise.all([redisPromise, dbPromise]);
  });

  return Promise.all(all);
}

function simURL(n) {
  return `https://fly.sportsdata.io/v3/nfl/stats/json/SimulatedBoxScoresV3/${n}?key=${sportsdataio}`;
}

function statSim() {
  let count = 0;

  setInterval(() => {
    // eslint-disable-next-line no-console
    console.log(count);
    axios.get(simURL(count)).then(setStatPrices);
    count += 1;
  }, 5000);
}

const livemap = {};

function setProjPrices({ data }) {
  const out = data[1].PlayerGames;
  return Promise.all(out.map((p) => {
    const { PlayerID, FantasyPoints } = p;
    if (!livemap[PlayerID]) { livemap[PlayerID] = {}; }
    if (!livemap[PlayerID].projPrice) { livemap[PlayerID].projPrice = null; }

    if (!livemap[PlayerID].projPrice !== FantasyPoints) {
      return setLatest(PlayerID, FantasyPoints, null);
    }
    return Promise.resolve();
  }));
}

function setStatPrices({ data }) {
  const out = data[1].PlayerGames;
  return Promise.all(out.map((p) => {
    const { PlayerID, FantasyPoints } = p;
    if (!livemap[PlayerID]) { livemap[PlayerID] = {}; }
    if (!livemap[PlayerID].statPrice > 0) { livemap[PlayerID].statPrice = 0; }

    if (livemap[PlayerID].statPrice !== FantasyPoints) {
      livemap[PlayerID].statPrice = FantasyPoints;
      return setLatest(PlayerID, null, FantasyPoints);
    }
    return Promise.resolve();
  }));
}

// Pull all latest price info from redis for all players
async function setLatest(nflplayerID, inprojPrice, instatPrice) {
  const projPrice = (inprojPrice ? Math.round(inprojPrice * 100).toString() : inprojPrice);
  const statPrice = (instatPrice ? Math.round(instatPrice * 100).toString() : instatPrice);
  const argarray = [rediskeys.statHash(nflplayerID)];
  let pubobj = { nflplayerID };
  if (projPrice !== null) { argarray.push('projPrice', projPrice); pubobj = { ...pubobj, projPrice }; }
  if (statPrice !== null) { argarray.push('statPrice', statPrice); pubobj = { ...pubobj, statPrice }; }
  return hsetAsync(argarray)
    .then(() => {
      client.publish('statUpdate', JSON.stringify(pubobj));
    });
}

// Player Game Stats by Week => "FantasyPoints"
// Player Game Stats by Week Delta
// Player Game Stats Delta
// Projected Player Game Stats by Week (w/ Injuries, Lineups, DFS Salaries) => "FantasyPoints"
// Fantasy Defense Game Stats
// Projected Fantasy Defense Game Stats (w/ DFS Salaries)

// Box Scores V3 Simulation
module.exports = {
  dbSet,
  statSim,
};
