// Entry service covers:
    // Creating and deleting an entry
    // Getting info about a specific entry
    // Getting info about a user's entries across contests

const { Entry, User, Contest } = require('../../models');
const u = require('../util/util');
const { Op } = require("sequelize");
const sequelize = require('../../db');
const { canUserSeeLeague } = require('../util/util.service');
const config = require('../../config');
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
            console.log(obj);
            return Entry.create(obj, u.tobj(t)).then(u.dv);
        })
        .catch(err => {console.log(err); u.Error(err.parent.constraint, 406)});
    },

    // Private - get all entries across all contests for the current week
    async getWeekEntries() {
        const weekcontests = await Contest.findAll({
                where: {
                    nflweek: config.currentNFLWeek
                }
            })
            .then(u.dv)
            .then(contests => contests.map(c => c.id));
        return Entry.findAll({
                where: {
                    ContestId: {
                        [Op.or]: weekcontests,
                    }
                },
                include: {
                    model: User
                }
            })
            .then(u.dv);
    }
};