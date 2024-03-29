import Joi from 'joi';
import { Op, Transaction } from 'sequelize';

import { EntryActionKinds, RosterPositions, RPosType } from '../../../../types/rosterinfo';
import Entry from '../../entry/entry.model';
import NFLGame from '../../nflgame/nflgame.model';
import NFLPlayer from '../../nflplayer/nflplayer.model';
import {
  validate, uError, isPlayerOnRoster, isOpenRoster, isInvalidSpot,
} from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import EntryAction from '../entryaction.model';

const schema = Joi.object<TradeAddInput>({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    price: Joi.number().integer().greater(0).optional()
      .messages({
        'number.base': 'Price is invalid',
        'number.integer': 'Price is invalid',
        'number.greater': 'Price must be greater than 0',
      }),
    rosterposition: Joi.valid(...RosterPositions).optional().messages({
      'string.base': 'Position is invalid',
    }),
  }).required(),
});

interface TradeAddInput extends ServiceInput {
  params: { contestID: number },
  body: {
    nflplayerID: number,
    rosterposition?: RPosType,
    price?: number,
  }
}

/** Add a player within a transaction, but don't commit */
async function tradeAdd(req: TradeAddInput, t: Transaction) {
  const value = validate(req, schema);

  // Get user entry
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!theentry) { throw uError('No entry found', 404); }

  // Determine if user already has player on roster
  const theplayer = value.body.nflplayerID;
  const isOnTeam = isPlayerOnRoster(theentry, theplayer);
  if (isOnTeam) { throw uError('Player is on roster', 406); }

  const pts = theentry.pointtotal;
  // console.log("POINTS", pts);

  // Get player price and position
  const playerdata = await NFLPlayer.findByPk(theplayer);
  if (!playerdata || !playerdata.active) { throw uError('Player not found', 404); }

  const playerType = playerdata.NFLPositionId;
  if (value.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = isInvalidSpot(playerType, value.body.rosterposition);
    if (isinvalid) { throw uError(isinvalid, 406); }
    // Is it an empty one?
    if (theentry[value.body.rosterposition] !== null) {
      throw uError('There is a player in that spot', 406);
    }
    const newSet: Record<string, number> = {};
    newSet[value.body.rosterposition] = theplayer;
    theentry.set(newSet);
  } else {
    // Find an open spot
    const isOpen = isOpenRoster(theentry, playerType);
    if (!isOpen) {
      throw uError('There are no open spots', 406);
    }
    theentry[isOpen] = theplayer;
  }

  // Get player price and position
  const gamedata = await NFLGame.findOne({
    where: {
      [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
      week: Number(process.env['WEEK']),
    },
  });
  if (!gamedata) throw uError('Could not find game data for this player', 404);

  // Determine price at which to trade
  let tradeprice: number;
  if (!value.body.price) {
    if (gamedata.phase !== 'pre') throw uError("Can't add during or after games", 406);
    if (!playerdata.preprice) throw uError('Player has no preprice', 500);
    tradeprice = playerdata.preprice;
  } else if (gamedata.phase !== 'mid') {
    throw uError("Can't trade before or after games", 406);
  } else {
    tradeprice = value.body.price;
  }
  if (tradeprice > pts) { throw uError("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.set({
    pointtotal: theentry.pointtotal -= tradeprice,
  });

  await theentry.save({ transaction: t });

  if (gamedata.phase === 'pre') {
    await EntryAction.create({
      EntryActionKindId: EntryActionKinds.Add.id,
      UserId: value.user,
      ContestId: value.params.contestID,
      NFLPlayerId: theplayer,
      price: tradeprice,
    }, { transaction: t });
  }

  return theentry;
}

export default tradeAdd;
