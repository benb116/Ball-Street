// Entry service covers:
    // Creating and deleting an entry
    // Getting info about a specific entry
    // Getting info about a user's entries across contests

const { Entry, User } = require('../../models');
const u = require('../util/util');
const sequelize = require('../../db');
const { canUserSeeLeague } = require('../util/util.service');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    // Show all entries in a contest
    getContestEntries(req) {
        // Only show a specific contest's data if user is in contest's league
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            const includeObj = (_league.ispublic ? {} : { model: User });
            return Entry.findAll({ where: { ContestId: req.params.contestID }, includeObj });
        });
    },

    // Show a specific of the user's entries
    getEntry(req) {
        return Entry.findOne({
            where: {
                UserId: req.session.user.id,
                ContestId: req.params.contestID
            }
        }).then(u.dv);
    },
    
    // Join a new contest
    async createEntry(req) {
        let obj = {};
        obj.UserId = req.session.user.id;
        obj.ContestId = req.params.contestID;
        // Only allow if user is in contest's league
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            obj.pointtotal = _league.budget;
            return Entry.create(obj, u.tobj(t)).then(u.dv);
        })
        .catch(err => u.Error(err.parent.constraint, 406));
    }
};