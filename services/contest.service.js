// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest } = require('../models');
const u = require('../util');
const config = require('../config');
const { canUserSeeContest } = require('./util.service');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    // Get info for a specific contest
    getContest(req) {
        // Requires authorization or looking at a public league
        return sequelize.transaction(isoOption, async (t) => {
            const [_contest, _league] = await canUserSeeContest(t, req.session.user.id, req.params.contestID);
            return _contest;
        });
    },

    // Create a new contest in a private league
    createContest(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            if (league.ispublic) { return new Error('Cannot create contests in a public league'); }
            if (req.session.user.id !== _league.adminId) { return new Error('Must be league admin to make new contests'); }
            return Contest.create({
                name: req.body.name,
                nflweek: config.currentNFLWeek,
                LeagueId: league.id,
            });
        });
    },
};