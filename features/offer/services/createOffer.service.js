const Queue = require('bull');
const Joi = require('joi');

const offerQueue = new Queue('offer-queue');

const config = require('../../../config');
const u = require('../../util/util');

const sequelize = require('../../../db');
const {
  Offer, Entry, NFLPlayer,
} = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().optional(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().keys({
    offerobj: Joi.object().keys({
      nflplayerID: Joi.string().alphanum().trim().required(),
      isbid: Joi.boolean().required(),
      price: Joi.number().integer().greater(0).required(),
      protected: Joi.boolean().required(),
    }).required(),
  }).required(),
});

function createOffer(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  const obj = value.body.offerobj;
  obj.userID = value.user;
  return sequelize.transaction(isoOption, async (t) => {
    // Find user's entry
    const theentry = await Entry.findOne({
      where: {
        UserId: obj.userID,
        ContestId: value.params.contestID,
      },
    }, u.tobj(t));
    if (!theentry) { u.Error('No entry found', 404); }

    // Player should be in entry for ask, not for bid
    const isOnTeam = u.isPlayerOnRoster(theentry, obj.nflplayerID);
    if (!obj.isbid) {
      if (!isOnTeam) { u.Error('Player is not on roster', 404); }
    } else {
      if (isOnTeam) { u.Error('Player is on roster already', 409); }

      const pts = theentry.dataValues.pointtotal;
      if (obj.price > pts) { u.Error("User doesn't have enough points to offer", 402); }

      const playerdata = await NFLPlayer.findByPk(obj.nflplayerID, {
        attributes: ['NFLPositionId'],
        transaction: t,
      }).then(u.dv);
        // Only allow offer if there's currently room on the roster
        // TODO make linked offers? I.e. sell player at market price to make room for other player
      if (!u.isOpenRoster(theentry, playerdata.NFLPositionId)) { u.Error('There are no spots this player could fit into', 409); }
    }

    return Offer.create({
      UserId: obj.userID,
      ContestId: value.params.contestID,
      NFLPlayerId: obj.nflplayerID,
      isbid: obj.isbid,
      price: obj.price,
      protected: obj.protected || config.DefaultProtected,
    }, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    }).catch((err) => {
      u.Error(err, 406);
    });
  })
    .then(u.dv).then((offer) => {
      offerQueue.add(offer);
      return offer;
    });
}

module.exports = createOffer;
