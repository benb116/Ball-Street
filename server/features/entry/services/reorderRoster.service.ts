import Joi from 'joi';

import {
  FlexNFLPositionId, NFLPosTypes, Roster, RosterPositions, RPosType,
} from '@server/config';

import { tobj, validate, uError } from '@util/util';
import errorHandler, { ServiceInput } from '@util/util.service';
import validators from '@util/util.schema';

import sequelize from '@db';
import NFLPlayer from '@features/nflplayer/nflplayer.model';
import Entry from '../entry.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    pos1: Joi.string().trim().valid(...RosterPositions).required()
      .messages({
        'string.base': 'First position is invalid',
        'any.required': 'Please specify a first position',
      }),
    pos2: Joi.string().trim().valid(...RosterPositions).required()
      .messages({
        'string.base': 'Second position is invalid',
        'any.required': 'Please specify a second position',
      }),
  }).required(),
});

interface ReorderRosterInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    pos1: RPosType,
    pos2: RPosType,
  }
}

// Swap players in positions of an entry
async function reorderRoster(req: ReorderRosterInput) {
  const value: ReorderRosterInput = validate(req, schema);

  return sequelize.transaction(async (t) => {
    // Get position types
    const postype1 = Roster[value.body.pos1];
    const postype2 = Roster[value.body.pos2];

    // Can this swap be done?
    if (postype1 === FlexNFLPositionId && postype2 !== FlexNFLPositionId && !NFLPosTypes[postype2].canflex) {
      // if pos1 is flex but pos2 is a type that can't flex then no
      return uError('Cannot put a non-flex player in a flex position', 406);
    } if (postype2 === FlexNFLPositionId && postype1 !== FlexNFLPositionId && !NFLPosTypes[postype1].canflex) {
      // same other way around
      return uError('Cannot put a non-flex player in a flex position', 406);
    } if (postype1 !== postype2 && postype1 !== FlexNFLPositionId && postype2 !== FlexNFLPositionId) {
      // If neither is a flex position, then definitely can't if they're different
      return uError('Cannot put that player in that position', 406);
    }

    const theentry = await Entry.findOne({
      where: {
        UserId: value.user,
        ContestId: value.params.contestID,
      },
      ...tobj(t),
    });
    if (!theentry) { return uError('No entry found', 404); }

    const playerIDin1 = theentry[value.body.pos1];
    const playerIDin2 = theentry[value.body.pos2];

    // If both are empty, don't do anything
    if (!playerIDin1 && !playerIDin2) {
      return uError('No players found', 404);
    }

    // Can we move players into the other positions?
    if (typeof playerIDin1 === 'number') {
      const player1 = await NFLPlayer.findByPk(playerIDin1);
      if (!player1) return uError('No player found', 404);
      if (player1.NFLPositionId !== postype2) {
        if (postype2 !== FlexNFLPositionId || !NFLPosTypes[player1.NFLPositionId].canflex) {
          return uError('Cannot put that player in that position', 406);
        }
      }
    }
    if (typeof playerIDin2 === 'number') {
      const player2 = await NFLPlayer.findByPk(playerIDin2);
      if (!player2) return uError('No player found', 404);
      if (player2.NFLPositionId !== postype1) {
        if (postype1 !== FlexNFLPositionId || !NFLPosTypes[player2.NFLPositionId].canflex) {
          return uError('Cannot put that player in that position', 406);
        }
      }
    }
    if ((typeof playerIDin1 === 'number' || playerIDin1 === null)
     && (typeof playerIDin2 === 'number' || playerIDin2 === null)) {
      theentry[value.body.pos2] = playerIDin1;
      theentry[value.body.pos1] = playerIDin2;
    }

    await theentry.save({ transaction: t });
    return theentry;
  }).catch(errorHandler({
    default: { message: 'Roster could not be reordered', status: 500 },
  }));
}

export default reorderRoster;
