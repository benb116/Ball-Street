const getUserLeagues = require('./services/getUserLeagues.service');
const getPublicLeagues = require('./services/getPublicLeagues.service');
const getLeague = require('./services/getLeague.service');
const getLeagueUsers = require('./services/getLeagueUsers.service');
const createLeague = require('./services/createLeague.service');
const addMember = require('./services/addMember.service');
const join = require('./services/join.service');

module.exports = {
  getUserLeagues,
  getPublicLeagues,
  getLeague,
  getLeagueUsers,
  createLeague,
  addMember,
  join,
};
