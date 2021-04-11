// NFL service covers:
    // Getting info about a specific player
    // Get order book info about a specific player

const { Op } = require("sequelize");
const { NFLPlayer, Offer, Trade, Entry } = require('../models');
const u = require('../util');
const config = require('../config');

module.exports = {
    // Get a specific player
    getNFLPlayer(req) {
        return NFLPlayer.findOne({ where: { NFLPlayerId: req.params.nflplayerID } }).then(u.dv);
    },

    // Get all players
    getNFLPlayers(req) {
        return NFLPlayer.findAll().then(u.dv);
    },

    // Get a count of bids and asks at every price
    getNFLPlayerOfferSummary(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
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
            }, u.tobj(t));
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
            }, u.tobj(t));

            return Promise.all([bids, asks]).then(u.dv);
        });
    },
    getNFLPlayerTradeVolume(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            return Offer.count({
                where: {
                    ContestId: req.params.contestID,
                    NFLPlayerId: req.params.nflplayerID
                }
            }, u.tobj(t)).then(u.dv).then(out => out / 2);
        });
    },
    getNFLPlayerNumAdds(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            return Entry.count({
                where: {
                    ContestId: req.params.contestID,
                    [Op.or]: gen(req.params.nflplayerID)
                }
            }, u.tobj(t)).then(u.dv);
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