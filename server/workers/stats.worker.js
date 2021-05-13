const axios = require('axios');

// const config = require('../config');
const { sportsdataio } = require('../secret');
// const { statHashkey } = require('../db/redisSchema');

// Two clients - one to subscribe, one to read and write
// const client = redis.createClient();
// const client2 = redis.createClient();
// const setAsync = promisify(client2.set).bind(client2);

const playerService = require('../features/nflplayer/nflplayer.service');
const { NFLPlayer } = require('../models');

// Get a list of all player IDs
let playerIDs = [];
(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map((p) => p.id);
})();

console.log('begin');
// Get projected points before the game
const seasonString = '2020REG';
const weekString = '1';
const projectedURL = `https://fly.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/${seasonString}/${weekString}?key=${sportsdataio}`;
const statURL = `https://fly.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/${seasonString}/${weekString}?key=${sportsdataio}`;
axios.get(projectedURL).then(setPrePrice);
axios.get(statURL).then(setStatPrice);

function setPrePrice({ data }) {
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

function setStatPrice({ data }) {
  const all = data.map((p) => {
    const { PlayerID, FantasyPoints } = p;
    return NFLPlayer.update({
      statprice: Math.round(FantasyPoints * 100),
    },
    {
      where: {
        id: PlayerID,
      },
    });
  });

  return Promise.all(all);
}

// Player Game Stats by Week => "FantasyPoints"
// Player Game Stats by Week Delta
// Player Game Stats Delta
// Projected Player Game Stats by Week (w/ Injuries, Lineups, DFS Salaries) => "FantasyPoints"
// Fantasy Defense Game Stats
// Projected Fantasy Defense Game Stats (w/ DFS Salaries)
