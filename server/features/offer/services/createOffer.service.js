const Queue = require('bull');
const Joi = require('joi');

const offerQueue = new Queue('offer-queue');

const config = require('../../../config');
const u = require('../../util/util');
const { validators } = require('../../util/util.schema');
const { getGamePhase } = require('../../util/util.service');

const sequelize = require('../../../db');
const { Offer, Entry, NFLPlayer } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    offerobj: Joi.object().keys({
      nflplayerID: validators.nflplayerID,
      isbid: Joi.boolean().required().messages({
        'boolean.base': 'Offer type is invalid',
        'any.required': 'Please specify bid or ask',
      }),
      price: Joi.number().integer().greater(0).required()
        .messages({
          'number.base': 'Price is invalid',
          'number.integer': 'Price is invalid',
          'number.greater': 'Price must be greater than 0',
          'any.required': 'Please specify a price',
        }),
      protected: Joi.boolean().optional(),
    }).required(),
  }).required(),
});

async function createOffer(req) {
  const value = u.validate(req, schema);

  const phase = await getGamePhase();
  if (phase !== 'mid') {
    u.Error("Can't make an offer before or after games", 406);
  }

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
    });
  })
    .then(u.dv).then((offer) => {
      offerQueue.add(offer);
      return offer;
    })
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      if (errmess === 'IX_Offer-OneActive') { u.Error('An offer already exists for this player', 406); }
      u.Error(errmess, 406);
    });
}

module.exports = createOffer;
