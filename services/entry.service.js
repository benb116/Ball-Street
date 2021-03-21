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
                UserId: req.user.id,
                ContestId: req.param.contestID
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
    getUserEntries(req) {
        return Entry.findAll({
            where: {
                UserId: req.user.id,
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
    createEntry(req) {
        let obj = {};
        obj.UserId = req.user.id;
        obj.ContestId = req.param.contestID;
        if (req.param.startPoints) { obj.pointtotal = req.param.startPoints; }
        return Entry.create(obj).then(u.dv).then(console.log).catch(console.error);
    }
};