const { promisify } = require('util');

const { client } = require('../../db/redis');

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const { Membership, League, Contest } = require('../../models');
const u = require('./util');
const { gamePhaseKey, currentWeekKey } = require('../../db/redisSchema');

// Is a user allowed to see a league
// Yes if league is public OR if user is a member
async function canUserSeeLeague(t, userID, leagueID) {
  const tobj = (t ? { transaction: t } : {});
  const theleague = await League.findByPk(leagueID, tobj).then(u.dv);
  if (!theleague) { u.Error('No league found', 404); }
  if (theleague.ispublic) {
    return theleague;
  }
  const themember = await Membership.findOne({
    where: {
      LeagueId: leagueID,
      UserId: userID,
    },
  }, tobj);
    // If not a member, don't show
  if (!themember) { u.Error('You are not a member of that league', 403); }
  return theleague;
}

async function canUserSeeContest(t, userID, leagueID, contestID) {
  const tobj = (t ? { transaction: t } : {});
  const thecontest = await Contest.findByPk(contestID, tobj).then(u.dv);
  if (!thecontest) { u.Error('No contest found', 404); }
  const theleague = await canUserSeeLeague(t, userID, leagueID)
    .catch((e) => u.Error(e.message, e.status));
  if (thecontest.LeagueId !== leagueID) { u.Error('Contest and league do not match', 406); }
  return [theleague, thecontest];
}

async function getGamePhase() {
  return getAsync(gamePhaseKey());
}

async function getCurrentWeek() {
  return getAsync(currentWeekKey()).then(Number);
}

async function setGamePhase(str) {
  if (['pre', 'mid', 'post'].includes(str)) {
    return setAsync(gamePhaseKey(), str);
  }
  // eslint-disable-next-line no-console
  console.log(`Can't set game phase to ${str}`);
  return Promise.reject();
}

async function setCurrentWeek(weeknum) {
  if (Number.isInteger(weeknum)) {
    return setAsync(currentWeekKey(), weeknum.toString());
  }
  // eslint-disable-next-line no-console
  console.log(`Can't set weeknum to ${weeknum}`);
  return Promise.reject();
}

module.exports = {
  canUserSeeLeague,
  canUserSeeContest,
  getGamePhase,
  setGamePhase,
  getCurrentWeek,
  setCurrentWeek,
};
