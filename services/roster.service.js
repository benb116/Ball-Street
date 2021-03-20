// Roster service covers:
    // Getting info about a user's roster
    // Reordering a team

const {Roster} = require('../models');
const u = require('../util');

module.exports = {
    getUserRoster(req) {
        return Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
};