const Joi = require('joi');

const u = require('../../util/util');
const config = require('../../../config');

const sequelize = require('../../../db');
const { Entry, NFLPlayer } = require('../../../models');
const { errorHandler } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

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
  const value = u.validate(req, schema);

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
          u.Error('Cannot put a non-flex player in a flex position', 406);
        // same other way around
        } else if (postype2 === config.FlexNFLPositionId && !config.NFLPosTypes[postype1].canflex) {
          u.Error('Cannot put a non-flex player in a flex position', 406);
        }
      } else {
        u.Error('Cannot put that player in that position', 406);
      }
    }

    const theentry = await Entry.findOne({
      where: {
        UserId: value.user,
        ContestId: value.params.contestID,
      },
    }, u.tobj(t));
    if (!theentry) { u.Error('No entry found', 404); }

    const playerIDin1 = theentry[value.body.pos1];
    const playerIDin2 = theentry[value.body.pos2];

    // If both are empty, don't do anything
    if (!playerIDin1 && !playerIDin2) {
      u.Error('No players found', 404);
    }

    if (playerIDin1) {
      const player1 = await NFLPlayer.findByPk(playerIDin1).then(u.dv);
      if (player1.NFLPositionId !== postype2) {
        if (postype2 !== config.FlexNFLPositionId
          || !config.NFLPosTypes[player1.NFLPositionId].canflex) {
          u.Error('Cannot put that player in that position', 406);
        }
      }
    }
    if (playerIDin2) {
      const player2 = await NFLPlayer.findByPk(playerIDin2).then(u.dv);
      if (player2.NFLPositionId !== postype1) {
        if (postype1 !== config.FlexNFLPositionId
          || !config.NFLPosTypes[player2.NFLPositionId].canflex) {
          u.Error('Cannot put that player in that position', 406);
        }
      }
    }

    theentry[value.body.pos1] = playerIDin2;
    theentry[value.body.pos2] = playerIDin1;

    await theentry.save({ transaction: t });
    return u.dv(theentry);
  }).catch(errorHandler({
    default: ['Roster could not be reordered', 500],
  }));
}

module.exports = reorderRoster;
