// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest } = require('../models');
const u = require('../util');

module.exports = {
    getContest(req, res) {
        console.log(req.params.contestID);
        return Contest.findOne({
            where: {
                id: req.params.contestID
            }
        }).then(u.dv).catch(console.error);
    },
    getUserContests(req) {
        return Contest.findAll({
            where: {
                UserId: req.session.user.id,
            }
        }).then(u.dv).then(console.log).catch(console.error);
    }
};