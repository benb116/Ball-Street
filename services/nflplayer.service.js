// NFL service covers:
    // Getting info about a specific player
    // Get order book info about a specific player

const { NFLPlayer, Offer, Trade } = require('../models');
const u = require('../util');

module.exports = {
    getNFLPlayer(req) {
        return NFLPlayer.findOne({
            where: {
                NFLPlayerId: req.param.nflplayerID
            }
        }).then(u.dv).then(console.log).catch(console.error);
    },
    getNFLPlayerOfferSummary(req) {
        const bids = Offer.count({
            group: 'price',
            where: {
                NFLPlayerId: req.param.nflplayerID,
                ContestId: req.param.contestID,
                filled: false,
                cancelled: false,
                isbid: true
            },
            attributes: ['price'],
        });
        const asks = Offer.count({
            group: 'price',
            where: {
                NFLPlayerId: req.param.nflplayerID,
                ContestId: req.param.contestID,
                filled: false,
                cancelled: false,
                isbid: false
            },
            attributes: ['price'],
        });

        return Promise.all([bids, asks]);
    },
    getNFLPlayerTradeVolume(req) {
        return Trade.count({
            where: {
                ContestId: req.param.contestID,
                NFLPlayerId: req.param.nflplayerID
            }
        });
    },
    getNFLPlayerNumAdds(req) {
        return Roster.count({
            where: {
                ContestId: req.param.contestID,
                NFLPlayerId: req.param.nflplayerID
            }
        });
    }
};