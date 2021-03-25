// NFL service covers:
    // Getting info about a specific player
    // Get order book info about a specific player

const { NFLPlayer, Offer, Trade, Entry } = require('../models');
const u = require('../util');
const config = require('../config');

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
    // getNFLPlayerNumAdds(req) {
    //     return Entry.count({
    //         where: {
    //             ContestId: req.param.contestID,
    //             [Op.or]: gen(req.param.nflplayerID)
    //         }
    //     });

    //     function gen(_player) {
    //         const rpos = Object.keys(config.Roster);
    //         return rpos.map(r => {
    //             let out = {};
    //             out[r] = _player;
    //             return out;
    //         });
    //     }
    // }
};