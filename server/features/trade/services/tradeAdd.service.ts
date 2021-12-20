import Joi from 'joi';
import { Op, Transaction } from 'sequelize';

import {
  dv, validate, uError, isPlayerOnRoster, isOpenRoster, isInvalidSpot,
} from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import Entry, { EntryType } from '../../entry/entry.model';
import NFLGame, { NFLGameType } from '../../nflgame/nflgame.model';
import NFLPlayer, { NFLPlayerType } from '../../nflplayer/nflplayer.model';

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

interface TradeAddInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    nflplayerID: number,
    rosterposition?: string,
    price?: number,
  }
}

// Add a player within a transaction, but don't commit
async function tradeAdd(req: TradeAddInput, t: Transaction) {
  const value: TradeAddInput = validate(req, schema);

  // Get user entry
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!theentry) { return uError('No entry found', 404); }
  const entryValues: EntryType = dv(theentry);

  // Determine if user already has player on roster
  const theplayer = value.body.nflplayerID;
  const isOnTeam = isPlayerOnRoster(entryValues, theplayer);
  if (isOnTeam) { uError('Player is on roster', 406); }

  const pts = entryValues.pointtotal;
  // console.log("POINTS", pts);

  // Get player price and position
  const playerdata: NFLPlayerType = await NFLPlayer.findByPk(theplayer).then(dv);
  if (!playerdata || !playerdata.active) { uError('Player not found', 404); }

  const playerType = playerdata.NFLPositionId;
  if (value.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = isInvalidSpot(playerType, value.body.rosterposition);
    if (isinvalid) { uError(isinvalid, 406); }
    // Is it an empty one?
    if (entryValues[value.body.rosterposition] !== null) {
      uError('There is a player in that spot', 406);
    }
    const newSet: Record<string, number> = {};
    newSet[value.body.rosterposition] = theplayer;
    theentry.set(newSet);
  } else {
    // Find an open spot
    const isOpen = isOpenRoster(entryValues, playerType);
    if (!isOpen) {
      uError('There are no open spots', 406);
    } else {
      const newSet: Record<string, number> = {};
      newSet[isOpen] = theplayer;
      theentry.set(newSet);
    }
  }

  // Get player price and position
  const gamedata: NFLGameType = await NFLGame.findOne({
    where: {
      [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
      week: Number(process.env.WEEK),
    },
  }).then(dv);
  if (!gamedata) uError('Could not find game data for this player', 404);

  // Determine price at which to trade
  let tradeprice: number;
  if (!value.body.price) {
    if (gamedata.phase !== 'pre') uError("Can't add during or after games", 406);
    if (!playerdata.preprice) return uError('Player has no preprice', 500);
    tradeprice = playerdata.preprice;
  } else if (gamedata.phase !== 'mid') {
    return uError("Can't trade before or after games", 406);
  } else {
    tradeprice = value.body.price;
  }

  if (tradeprice > pts) { uError("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.set({
    pointtotal: entryValues.pointtotal -= tradeprice,
  });

  await theentry.save({ transaction: t });

  return theentry;
}

export default tradeAdd;
