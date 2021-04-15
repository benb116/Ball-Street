const { Contest, Membership, League} = require('../../models');
const u = require('../util/util');

async function canUserSeeContest(t, userID, contestID) {
    const _contest = await Contest.findByPk(contestID, { include: { model: League } }, { transaction: t }).then(u.dv);
    if (!_contest) { u.Error('No contest found', 404); }
    let _league = _contest.League;
    if (!_league.ispublic) {
        await canUserSeeLeague(t, userID, _contest.LeagueId);
    }
    return [_contest, _league];
}

async function canUserSeeLeague(t, userID, leagueID) {
    const tobj = (t ? { transaction: t } : {});
    const _league = await League.findByPk(leagueID, tobj).then(u.dv);
    if (!_league) { u.Error('No league found', 404); }
    if (_league.ispublic) {
        return _league;
    }
    const _member = await Membership.findOne({
        where: {
            LeagueId: leagueID,
            UserId: userID,
        }
    }, tobj);
    // If not a member, don't show
    if (!_member) { u.Error('You are not a member of that league', 403); }
    return _league;
}

module.exports = {
    canUserSeeContest,
    canUserSeeLeague,
};