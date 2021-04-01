// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest, Entry } = require('../models');
const u = require('../util');
const { canUserSeeContest } = require('./util.service');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    // Get all of the contests that a user has joined (made an entry)
    getUserContests(req) {
        return Entry.findAll({
            where: {
                UserId: req.session.user.id,
            },
            include: {
                model: Contest
            }
        }).then(u.dv);
    },

    // Get info for a specific contest
    getContest(req) {
        // Requires authorization or looking at a public league
        return sequelize.transaction(isoOption, async (t) => {
            const [_contest, _league] = await canUserSeeContest(t, req.session.user.id, req.params.contestID);
            return _contest;
        });
    }
};