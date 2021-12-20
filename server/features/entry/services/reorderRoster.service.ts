import Joi from 'joi';

import { FlexNFLPositionId, NFLPosTypes, Roster } from '../../../config';

import {
  dv, tobj, validate, uError,
} from '../../util/util';
import errorHandler, { ServiceInput } from '../../util/util.service';
import validators from '../../util/util.schema';

import sequelize from '../../../db';
import Entry, { EntryType } from '../entry.model';
import NFLPlayer, { NFLPlayerType } from '../../nflplayer/nflplayer.model';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    pos1: Joi.string().trim().valid(...Object.keys(Roster)).required()
      .messages({
        'string.base': 'First position is invalid',
        'any.required': 'Please specify a first position',
      }),
    pos2: Joi.string().trim().valid(...Object.keys(Roster)).required()
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
    pos1: string,
    pos2: string,
  }
}

// Swap players in positions of an entry
async function reorderRoster(req: ReorderRosterInput) {
  const value: ReorderRosterInput = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    // Get position types
    const postype1 = Roster[value.body.pos1];
    const postype2 = Roster[value.body.pos2];

    // Can this swap be done?
    // If same position type, then always yes
    // If not then
    if (postype1 !== postype2) {
      // If neither is a flex position, then definitely can't
      if (postype1 === FlexNFLPositionId || postype2 === FlexNFLPositionId) {
        // if pos1 is flex but pos2 is a type that can't flex then no
        if (postype1 === FlexNFLPositionId && !NFLPosTypes[postype2].canflex) {
          uError('Cannot put a non-flex player in a flex position', 406);
        // same other way around
        } else if (postype2 === FlexNFLPositionId && !NFLPosTypes[postype1].canflex) {
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
      ...tobj(t),
    });
    if (!theentry) { return uError('No entry found', 404); }

    const entryVal: EntryType = dv(theentry);
    const playerIDin1 = entryVal[value.body.pos1];
    const playerIDin2 = entryVal[value.body.pos2];

    // If both are empty, don't do anything
    if (!playerIDin1 && !playerIDin2) {
      return uError('No players found', 404);
    }

    // Can we move players into the other positions?
    if (typeof playerIDin1 === 'number') {
      const player1: NFLPlayerType = await NFLPlayer.findByPk(playerIDin1).then(dv);
      if (!player1) return uError('No player found', 404);
      if (player1.NFLPositionId !== postype2) {
        if (postype2 !== FlexNFLPositionId || !NFLPosTypes[player1.NFLPositionId].canflex) {
          return uError('Cannot put that player in that position', 406);
        }
      }
    }
    if (typeof playerIDin2 === 'number') {
      const player2: NFLPlayerType = await NFLPlayer.findByPk(playerIDin2).then(dv);
      if (!player2) return uError('No player found', 404);
      if (player2.NFLPositionId !== postype1) {
        if (postype1 !== FlexNFLPositionId || !NFLPosTypes[player2.NFLPositionId].canflex) {
          return uError('Cannot put that player in that position', 406);
        }
      }
    }
    const newSet: Record<string, number | null> = {};
    if ((typeof playerIDin1 === 'number' || playerIDin1 === null)
     && (typeof playerIDin2 === 'number' || playerIDin2 === null)) {
      newSet[value.body.pos2] = playerIDin1;
      newSet[value.body.pos1] = playerIDin2;
    }

    theentry.set(newSet);

    await theentry.save({ transaction: t });
    return dv(theentry);
  }).catch(errorHandler({
    default: { message: 'Roster could not be reordered', status: 500 },
  }));
}

export default reorderRoster;
