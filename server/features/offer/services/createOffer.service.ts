import Queue from 'bull'
import Joi from 'joi'

import { Op } from 'sequelize'
import config from '../../../config'
import { dv, tobj, validate, uError, isPlayerOnRoster, isOpenRoster } from '../../util/util'
import validators from '../../util/util.schema'

import sequelize from '../../../db'
import {
  Offer, Entry, NFLPlayer, NFLGame,
} from '../../../models'

import { queueOptions } from '../../../db/redis'
import { errorHandler } from '../../util/util.service'

const offerQueue = new Queue('offer-queue', queueOptions);

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    offerobj: Joi.object().keys({
      nflplayerID: validators.nflplayerID,
      isbid: Joi.boolean().required().messages({
        'boolean.base': 'Offer type is invalid',
        'any.required': 'Please specify bid or ask',
      }),
      price: Joi.number().integer().greater(0).multiple(100)
        .required()
        .messages({
          'number.base': 'Price is invalid',
          'number.integer': 'Price is invalid',
          'number.greater': 'Price must be greater than 0',
          'number.multiple': 'Price must be a whole number',
          'any.required': 'Please specify a price',
        }),
      protected: Joi.boolean().optional(),
    }).required(),
  }).required(),
});

async function createOffer(req) {
  const value = validate(req, schema);

  const obj = value.body.offerobj;
  obj.userID = value.user;
  return sequelize.transaction(isoOption, async (t) => {
    // Find user's entry
    const theentry = await Entry.findOne({
      where: {
        UserId: obj.userID,
        ContestId: value.params.contestID,
      },
    }, tobj(t));
    if (!theentry) { uError('No entry found', 404); }

    const playerdata = await NFLPlayer.findByPk(obj.nflplayerID, {
      attributes: ['NFLPositionId', 'NFLTeamId', 'active'],
      transaction: t,
    }).then(dv);
    if (!playerdata || !playerdata.active) { uError('Player not found', 404); }

    // Player should be in entry for ask, not for bid
    const isOnTeam = isPlayerOnRoster(theentry, obj.nflplayerID);
    if (!obj.isbid) {
      if (!isOnTeam) { uError('Player is not on roster', 404); }
    } else {
      if (isOnTeam) { uError('Player is on roster already', 409); }

      const pts = theentry.dataValues.pointtotal;
      if (obj.price > pts) {
        uError("User doesn't have enough points to offer", 402);
      }
      // Only allow offer if there's currently room on the roster
      // TODO make linked offers? I.e. sell player at market price to make room for other player
      if (!isOpenRoster(theentry, playerdata.NFLPositionId)) {
        uError('There are no spots this player could fit into', 409);
      }
    }

    // Get player price and position
    const gamedata = await NFLGame.findOne({
      where: {
        [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
        week: Number(process.env.WEEK),
      },
    }, { transaction: t }).then(dv);
    if (!gamedata) uError('Could not find game data for this player', 404);
    if (gamedata.phase !== 'mid') {
      uError("Can't make an offer before or after games", 406);
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
    .then(dv).then((offer) => {
      offerQueue.add(offer);
      return offer;
    })
    .catch(errorHandler({
      default: ['Offer could not be created', 500],
      'IX_Offer-OneActive': ['An offer already exists for this player', 406],
    }));
}

export default createOffer;
