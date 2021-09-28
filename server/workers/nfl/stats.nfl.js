const axios = require('axios');
const logger = require('../../utilities/logger');
const dict = require('./dict.nfl');
const state = require('./state.nfl');

// Get all latest statlines and filter out ones we don't care about
function PullAllStats() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
    .then((raw) => raw.data.split('\n'))
    .then((lines) => lines.filter(StatType))
    .catch((err) => {
      logger.error(err);
      return [];
    });
}

// Allow a statline if it's one of the valid stat categories
function StatType(line) {
  return (dict.validStatLetters.indexOf(line[0]) > -1) ? line[0] : false;
}

// Determine if a statline has changed
function UpdateStats(line) {
  const terms = line.split('|');
  const stattype = terms[0];
  const playerid = terms[1];
  terms.shift();
  terms.shift();
  const statline = terms.join('|');
  if (!state.statObj[playerid]) state.statObj[playerid] = {};
  const diff = (
    !state.statObj[playerid][stattype]
    || state.statObj[playerid][stattype] !== statline
  );
  state.statObj[playerid][stattype] = statline;
  return diff;
}

module.exports = {
  PullAllStats,
  UpdateStats,
};
