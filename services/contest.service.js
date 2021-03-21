// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest } = require('../models');
const u = require('../util');

module.exports = {
    getContest(req) {
        return Contest.findOne({
            where: {
                ContestId: req.param.contestID
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
    getUserContests(req) {
        return Contest.findAll({
            where: {
                UserId: req.user.id,
            }
        }).then(u.dv).then(console.log).catch(console.error);
    }
};