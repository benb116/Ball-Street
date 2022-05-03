import Joi from 'joi';
import { Op, Transaction } from 'sequelize';

import {
  dv, validate, uError, isPlayerOnRoster,
} from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import Entry, { EntryType } from '../../entry/entry.model';
import NFLGame, { NFLGameType } from '../../nflgame/nflgame.model';
import NFLPlayer, { NFLPlayerType } from '../../nflplayer/nflplayer.model';
import EntryAction from '../entryaction.model';
import { EntryActionKinds } from '../../../config';

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
  }).required(),
});

interface TradeDropInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    nflplayerID: number,
    price?: number,
  }
}

async function tradeDrop(req: TradeDropInput, t: Transaction) {
  const value: TradeDropInput = validate(req, schema);

  // Remove from roster
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

  const theplayer = value.body.nflplayerID;
  const isOnTeam = isPlayerOnRoster(entryValues, theplayer);
  if (!isOnTeam) { return uError('Player is not on roster', 406); }
  const newSet: Record<string, null> = {};
  newSet[isOnTeam] = null;
  theentry.set(newSet);

  // How much to add to point total
  const playerdata: NFLPlayerType = await NFLPlayer.findByPk(theplayer).then(dv);
  if (!playerdata || !playerdata.active) { uError('Player not found', 404); }

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
  if (value.body.price) {
    if (gamedata.phase !== 'mid') return uError("Can't trade before or after games", 406);
    tradeprice = value.body.price;
  } else {
    if (gamedata.phase !== 'pre') return uError("Can't drop during or after games", 406);
    if (!playerdata.preprice) return uError('Player has no preprice', 500);
    tradeprice = playerdata.preprice;
  }

  theentry.set({
    pointtotal: entryValues.pointtotal += tradeprice,
  });
  await theentry.save({ transaction: t });

  if (gamedata.phase === 'pre') {
    await EntryAction.create({
      EntryActionKindId: EntryActionKinds.Drop.id,
      UserId: value.user,
      ContestId: value.params.contestID,
      NFLPlayerId: theplayer,
      price: tradeprice,
    }, { transaction: t });
  }
  return dv(theentry);
}

export default tradeDrop;
