// Entry service covers:
    // Creating and deleting an entry
    // Getting info about a specific entry
    // Getting info about a user's entries across contests
    // Getting info about all entries in a contest

const { Entry } = require('../models');
const u = require('../util');

module.exports = {
    getEntry(req) {
        let out;
        if (req.param.entryID) {
            out = Entry.findByPk(req.param.entryID);
        } else {
            out = Entry.findOne({
                where: {
                    UserId: req.user.id,
                    ContestId: req.param.contestID
                }
            });
        }
        return out.then(u.dv).then(console.log).catch(console.error);
    },
    createEntry(req) {
        let obj = {};
        obj.UserId = req.user.id;
        obj.ContestId = req.param.contestID;
        if (req.param.startPoints) { obj.pointtotal = req.param.startPoints; }
        return Entry.create(obj).then(u.dv).then(console.log).catch(console.error);
    }
};