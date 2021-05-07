const getLeagueContests = require('./services/getLeagueContests.service');
const getContest = require('./services/getContest.service');
const createContest = require('./services/createContest.service');

module.exports = {
  getLeagueContests,
  getContest,
  createContest,
};
