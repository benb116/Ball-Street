// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest } = require('../../models');
const u = require('../util/util');
const config = require('../../config');
const { canUserSeeLeague } = require('../util/util.service');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    // Get info for all contests in a specific league
    getLeagueContests(req) {
        // Requires authorization or looking at a public league
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            return Contest.findAll({
                where: {
                    LeagueId: req.params.leagueID
                }
            }, u.tobj(t));
        });
    },

    // Get info for a specific contest
    getContest(req) {
        // Requires authorization or looking at a public league
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            if (!_league) { u.Error('No league found', 404); }
            return Contest.findByPk(req.params.contestID, u.tobj(t));
        });
    },

    // Create a new contest in a private league
    createContest(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            if (league.ispublic) { u.Error('Cannot create contests in a public league', 403); }
            if (req.session.user.id !== _league.adminId) { u.Error('Must be league admin to make new contests', 403); }
            return Contest.create({
                name: req.body.name,
                nflweek: config.currentNFLWeek,
                LeagueId: league.id,
            }, u.tobj(t));
        });
    },
};