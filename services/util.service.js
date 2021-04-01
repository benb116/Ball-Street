const { Contest, Membership, League} = require('../models');
const u = require('../util');

async function canUserSeeContest(t, userID, contestID) {
    const _contest = await Contest.findByPk(contestID, { include: { model: League } }, u.tobj(t)).then(u.dv);
    if (!_contest) { return new Error('No contest found'); }
    let _league = _contest.League;
    if (!_league.ispublic) {
        await canUserSeeLeague(t, userID, _contest.LeagueId);
    }
    return [_contest, _league];
}

async function canUserSeeLeague(t, userID, leagueID) {
    const _league = await Membership.findOne({
        where: {
            UserId: userID,
            LeagueId: leagueID,
        },
        include: {
            model: League,
        }
    }, u.tobj(t)).then(u.dv).then(out => out.League);
    if (!_league) { return new Error('No league found'); }
    return _league;
}

module.exports = {
    canUserSeeContest,
    canUserSeeLeague,
};