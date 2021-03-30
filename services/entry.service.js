// Entry service covers:
    // Creating and deleting an entry
    // Getting info about a specific entry
    // Getting info about a user's entries across contests

const { Entry, Contest, Membership, League } = require('../models');
const u = require('../util');

module.exports = {
    getEntry(req) {
        return Entry.findOne({
            where: {
                UserId: req.session.user.id,
                ContestId: req.params.contestID
            }
        }).then(u.dv);
    },
    getUserEntries(req) {
        return Entry.findAll({
            where: {
                UserId: req.session.user.id,
            }
        }).then(u.dv);
    },
    async createEntry(req) {
        let obj = {};
        obj.UserId = req.session.user.id;
        obj.ContestId = req.body.contestID;
        return sequelize.transaction(isoOption, async (t) => {
            const leagueID = await Contest.findByPk(req.body.contestID, u.tobj(t)).then(u.dv).then(out => out.LeagueId);
            if (!leagueID) { return new Error('No contest found'); }
            const _league = await Membership.findOn({
                where: {
                    UserId: obj.UserId,
                    LeagueId: leagueID,
                },
                include: {
                    model: League,
                }
            }, u.tobj(t)).then(u.dv);
            if (!_league) { return new Error('No contest found'); }
            obj.pointtotal = _league.league.budget;
            return Entry.create(obj).then(u.dv);
        });
    }
};