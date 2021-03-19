// Roster controller covers:
    // Adding and dropping pregame
    // Getting info about a user's roster
    // Reordering a team

const {Roster} = require('../models')();

module.exports = {
    getUserRoster(req, res) {
        const userID = req.user.id;
        const contestID = req.param.contest;
        return Roster.findAll({
            where: {
                UserId: userID,
                ContestId: contestID
            }
        }).then(console.log);
    }
};