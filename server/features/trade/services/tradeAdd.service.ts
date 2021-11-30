import Joi from 'joi';

import { Op } from 'sequelize';
import {
  dv, validate, uError, isPlayerOnRoster, isOpenRoster, isInvalidSpot,
} from '../../util/util';
import validators from '../../util/util.schema';

import { Entry, NFLPlayer, NFLGame } from '../../../models';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    price: Joi.number().integer().greater(0).optional()
      .messages({
        'number.base': 'Price is invalid',
        'number.integer': 'Price is invalid',
        'number.greater': 'Price must be greater than 0',
      }),
    rosterposition: Joi.string().alphanum().optional().messages({
      'string.base': 'Position is invalid',
    }),
  }).required(),
});

// Add a player within a transaction, but don't commit
async function tradeAdd(req, t) {
  const value = validate(req, schema);

  const theplayer = value.body.nflplayerID;
  // Get user entry
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!theentry) { uError('No entry found', 404); }
  // Determine if user already has player on roster
  const isOnTeam = isPlayerOnRoster(theentry, theplayer);
  if (isOnTeam) { uError('Player is on roster', 406); }

  const pts = theentry.dataValues.pointtotal;
  // console.log("POINTS", pts);

  // Get player price and position
  const playerdata = await NFLPlayer.findByPk(theplayer, { transaction: t }).then(dv);
  if (!playerdata || !playerdata.active) { uError('Player not found', 404); }

  const playerType = playerdata.NFLPositionId;
  if (value.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = isInvalidSpot(playerType, value.body.rosterposition);
    if (isinvalid) { uError(isinvalid, 406); }
    // Is it an empty one?
    if (theentry[value.body.rosterposition] !== null) {
      uError('There is a player in that spot', 406);
    }
    theentry[value.body.rosterposition] = theplayer;
  } else {
    // Find an open spot
    const isOpen = isOpenRoster(theentry, playerType);
    if (!isOpen) {
      uError('There are no open spots', 406);
    } else {
      theentry[isOpen] = theplayer;
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

  if (!value.body.price) {
    if (gamedata.phase !== 'pre') {
      uError("Can't add during or after games", 406);
    }
  } else if (gamedata.phase !== 'mid') {
    uError("Can't trade before or after games", 406);
  }

  const tradeprice = value.body.price || playerdata.preprice;
  // Checks
  if (!tradeprice) { uError('Player has no preprice', 500); }
  if (tradeprice > pts) { uError("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.pointtotal -= tradeprice;

  await theentry.save({ transaction: t });

  return theentry;
}

export default tradeAdd;
