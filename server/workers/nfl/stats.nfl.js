const axios = require('axios');
const dict = require('./dict.nfl');
const state = require('./state.nfl');

// Get all latest statlines and filter out ones we don't care about
function PullAllStats() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
    .then((raw) => raw.data.split('\n'))
    .then((lines) => lines.filter(StatType));
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
  const dbid = dict.YahootoBSID(playerid, state);
  if (!state.statObj[dbid]) state.statObj[dbid] = {};
  const diff = (
    !state.statObj[dbid][stattype]
    || state.statObj[dbid][stattype] !== statline
  );
  state.statObj[dbid][stattype] = statline;
  return diff;
}

module.exports = {
  PullAllStats,
  UpdateStats,
};
