// Offer service covers:
    // Creating and deleting an offer
    // Getting info about a user's offers across contests

const { Offer } = require('../models');
const u = require('../util');

module.exports = {
    getUserOffers(req) {
        return Offer.findAll({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID,
                filled: false,
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
    createOffer(req) {
        let obj = req.param.offerObj;
        obj.UserId = req.user.id;

        // Can user submit offer? bid
            // Do they have the funds?
            // Do they have this player on their roster?
            // Do they have a spot on their roster?
        // Can user submit offer? ask
            // Do they have this player on their roster?

        return Offer.create(obj).then(u.dv).then(console.log).catch(console.error);
    },
    cancelOffer(req) {
        return Offer.destroy({
            where: {
                OfferId: req.param.offerID
            }
        }).then(u.dv);
    }
};