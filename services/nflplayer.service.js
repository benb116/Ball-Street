// NFL service covers:
    // Getting info about a specific player
    // Get order book info about a specific player

const { Op } = require("sequelize");
const { NFLPlayer, Offer, Trade, Entry } = require('../models');
const u = require('../util');
const config = require('../config');

module.exports = {
    getNFLPlayer(req) {
        return NFLPlayer.findOne({
            where: {
                NFLPlayerId: req.params.nflplayerID
            }
        }).then(u.dv);
    },
    getNFLPlayers(req) {
        return NFLPlayer.findAll().then(u.dv);
    },
    getNFLPlayerOfferSummary(req) {
        const bids = Offer.count({
            group: 'price',
            where: {
                NFLPlayerId: req.params.nflplayerID,
                ContestId: req.params.contestID,
                filled: false,
                cancelled: false,
                isbid: true
            },
            attributes: ['price'],
        });
        const asks = Offer.count({
            group: 'price',
            where: {
                NFLPlayerId: req.params.nflplayerID,
                ContestId: req.params.contestID,
                filled: false,
                cancelled: false,
                isbid: false
            },
            attributes: ['price'],
        });

        return Promise.all([bids, asks]).then(u.dv);
    },
    getNFLPlayerTradeVolume(req) {
        return Trade.count({
            include: {
                model: Offer,
                where: {
                    ContestId: req.params.contestID,
                    NFLPlayerId: req.params.nflplayerID
                }
            }
        }).then(u.dv);
    },
    getNFLPlayerNumAdds(req) {
        return Entry.count({
            where: {
                ContestId: req.params.contestID,
                [Op.or]: gen(req.params.nflplayerID)
            }
        });

        function gen(_player) {
            const rpos = Object.keys(config.Roster);
            return rpos.map(r => {
                let out = {};
                out[r] = _player;
                return out;
            });
        }
    }
};