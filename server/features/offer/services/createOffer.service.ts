import Queue from 'bull';
import Joi from 'joi';
import { Op } from 'sequelize';

import { DefaultProtected } from '../../../config';
import {
  tobj, validate, uError, isPlayerOnRoster, isOpenRoster,
} from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import { queueOptions } from '../../../db/redis';

import Entry from '../../entry/entry.model';
import NFLPlayer from '../../nflplayer/nflplayer.model';
import NFLGame from '../../nflgame/nflgame.model';
import Offer from '../offer.model';
import type { OfferItemType } from '../../../../types/api/offer.api';

const offerQueue = new Queue('offer-queue', queueOptions);

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
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

interface CreateOfferInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    offerobj: {
      nflplayerID: number,
      isbid: boolean,
      price: number,
      protected?: boolean
    }
  }
}

/** Create an offer in a contest */
async function createOffer(req: CreateOfferInput): Promise<OfferItemType> {
  const value: CreateOfferInput = validate(req, schema);

  return sequelize.transaction(async (t) => {
    // Find user's entry
    const theentry = await Entry.findOne({
      where: {
        UserId: value.user,
        ContestId: value.params.contestID,
      },
      ...tobj(t),
    });
    if (!theentry) { throw uError('No entry found', 404); }

    const playerdata = await NFLPlayer.findByPk(value.body.offerobj.nflplayerID, {
      attributes: ['NFLPositionId', 'NFLTeamId', 'active'],
      transaction: t,
    });
    if (!playerdata || !playerdata.active) { throw uError('Player not found', 404); }

    // Player should be in entry for ask, not for bid
    const isOnTeam = isPlayerOnRoster(theentry, value.body.offerobj.nflplayerID);
    if (!value.body.offerobj.isbid) {
      if (!isOnTeam) { throw uError('Player is not on roster', 404); }
    } else {
      if (isOnTeam) { throw uError('Player is on roster already', 409); }

      const pts = theentry.pointtotal;
      if (value.body.offerobj.price > pts) {
        throw uError("User doesn't have enough points to offer", 402);
      }
      // Only allow offer if there's currently room on the roster
      // TODO make linked offers? I.e. sell player at market price to make room for other player
      if (!isOpenRoster(theentry, playerdata.NFLPositionId)) {
        throw uError('There are no spots this player could fit into', 409);
      }
    }

    // Get player price and position
    const gamedata = await NFLGame.findOne({
      where: {
        [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
        week: Number(process.env['WEEK']),
      },
      transaction: t,
    });
    if (!gamedata) throw uError('Could not find game data for this player', 404);
    if (gamedata.phase !== 'mid') {
      throw uError("Can't make an offer before or after games", 406);
    }

    return Offer.create({
      UserId: value.user,
      ContestId: value.params.contestID,
      NFLPlayerId: value.body.offerobj.nflplayerID,
      isbid: value.body.offerobj.isbid,
      price: value.body.offerobj.price,
      protected: value.body.offerobj.protected || DefaultProtected,
    }, {
      transaction: t,
    });
  }).then((offer) => {
    offerQueue.add(offer);
    return offer;
  })
    .catch(errorHandler({
      default: { message: 'Offer could not be created', status: 500 },
      'IX_Offer-OneActive': { message: 'An offer already exists for this player', status: 406 },
    }));
}

export default createOffer;
