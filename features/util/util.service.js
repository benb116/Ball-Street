const { Contest, Membership, League } = require('../../models');
const u = require('./util');

async function canUserSeeContest(t, userID, contestID) {
  const thecontest = await Contest.findByPk(contestID, {
    include: {
      model: League,
    },
  }, { transaction: t }).then(u.dv);
  if (!thecontest) { u.Error('No contest found', 404); }
  const theleague = thecontest.League;
  if (!theleague.ispublic) {
    await canUserSeeLeague(t, userID, thecontest.LeagueId);
  }
  return [thecontest, theleague];
}

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

module.exports = {
  canUserSeeContest,
  canUserSeeLeague,
};
