// Entry service covers:
    // Creating and deleting an entry
    // Getting info about a specific entry
    // Getting info about a user's entries across contests

const { Entry } = require('../models');
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
    createEntry(req) {
        let obj = {};
        obj.UserId = req.session.user.id;
        obj.ContestId = req.body.contestID;
        if (req.body.startPoints) { obj.pointtotal = req.body.startPoints; }
        return Entry.create(obj).then(u.dv);
    }
};