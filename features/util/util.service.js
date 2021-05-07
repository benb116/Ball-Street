const { Membership, League, Contest } = require('../../models');
const u = require('./util');

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

module.exports = {
  canUserSeeLeague,
  canUserSeeContest,
};
