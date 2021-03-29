// Roster service covers:
    // Getting info about a user's roster
    // Reordering a team

const {Roster} = require('../models');
const u = require('../util');

module.exports = {
    getUserRoster(req) {
        return Roster.findAll({
            where: {
                UserId: req.session.user.id,
                ContestId: req.params.contestID
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
};