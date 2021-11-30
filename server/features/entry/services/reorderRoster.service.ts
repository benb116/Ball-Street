import Joi from 'joi';

import {
  dv, tobj, validate, uError,
} from '../../util/util';
import config from '../../../config';

import sequelize from '../../../db';
import { Entry, NFLPlayer } from '../../../models';
import { errorHandler } from '../../util/util.service';
import validators from '../../util/util.schema';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    pos1: Joi.string().trim().required().messages({
      'string.base': 'First position is invalid',
      'any.required': 'Please specify a first position',
    }),
    pos2: Joi.string().trim().required().messages({
      'string.base': 'Second position is invalid',
      'any.required': 'Please specify a second position',
    }),
  }).required(),
});

async function reorderRoster(req) {
  const value = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    const postype1 = config.Roster[value.body.pos1];
    const postype2 = config.Roster[value.body.pos2];

    // Can this swap be done?
    // If same position type, then always yes
    // If not then
    if (postype1 !== postype2) {
      // If neither is a flex position, then definitely can't
      if (postype1 === config.FlexNFLPositionId || postype2 === config.FlexNFLPositionId) {
        // if pos1 is flex but pos2 is a type that can't flex then no
        if (postype1 === config.FlexNFLPositionId && !config.NFLPosTypes[postype2].canflex) {
          uError('Cannot put a non-flex player in a flex position', 406);
        // same other way around
        } else if (postype2 === config.FlexNFLPositionId && !config.NFLPosTypes[postype1].canflex) {
          uError('Cannot put a non-flex player in a flex position', 406);
        }
      } else {
        uError('Cannot put that player in that position', 406);
      }
    }

    const theentry = await Entry.findOne({
      where: {
        UserId: value.user,
        ContestId: value.params.contestID,
      },
    }, tobj(t));
    if (!theentry) { uError('No entry found', 404); }

    const playerIDin1 = theentry[value.body.pos1];
    const playerIDin2 = theentry[value.body.pos2];

    // If both are empty, don't do anything
    if (!playerIDin1 && !playerIDin2) {
      uError('No players found', 404);
    }

    if (playerIDin1) {
      const player1 = await NFLPlayer.findByPk(playerIDin1).then(dv);
      if (player1.NFLPositionId !== postype2) {
        if (postype2 !== config.FlexNFLPositionId
          || !config.NFLPosTypes[player1.NFLPositionId].canflex) {
          uError('Cannot put that player in that position', 406);
        }
      }
    }
    if (playerIDin2) {
      const player2 = await NFLPlayer.findByPk(playerIDin2).then(dv);
      if (player2.NFLPositionId !== postype1) {
        if (postype1 !== config.FlexNFLPositionId
          || !config.NFLPosTypes[player2.NFLPositionId].canflex) {
          uError('Cannot put that player in that position', 406);
        }
      }
    }

    theentry[value.body.pos1] = playerIDin2;
    theentry[value.body.pos2] = playerIDin1;

    await theentry.save({ transaction: t });
    return dv(theentry);
  }).catch(errorHandler({
    default: ['Roster could not be reordered', 500],
  }));
}

export default reorderRoster;