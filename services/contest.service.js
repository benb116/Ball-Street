// Contest service covers:
    // Getting info about a specific contest
    // Getting info about a user's contests

const { Contest } = require('../models');
const u = require('../util');

module.exports = {
    getContest(req) {
        console.log(req.params.contestID);
        return Contest.findByPk(req.params.contestID).then(u.dv);
    },
    getUserContests(req) {
        return Contest.findAll({
            where: {
                UserId: req.session.user.id,
            }
        }).then(u.dv);
    }
};