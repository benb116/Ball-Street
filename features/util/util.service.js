const { Membership, League } = require('../../models');
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

module.exports = {
  canUserSeeLeague,
};
