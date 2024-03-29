import Joi from 'joi';
import { Op, Transaction } from 'sequelize';

import { EntryActionKinds } from '../../../../types/rosterinfo';
import Entry from '../../entry/entry.model';
import NFLGame from '../../nflgame/nflgame.model';
import NFLPlayer from '../../nflplayer/nflplayer.model';
import { validate, uError, isPlayerOnRoster } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import EntryAction from '../entryaction.model';

const schema = Joi.object<TradeDropInput>({
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
  }).required(),
});

interface TradeDropInput extends ServiceInput {
  params: { contestID: number },
  body: {
    nflplayerID: number,
    price?: number,
  }
}

/** Drop a player within a transaction, but don't commit */
async function tradeDrop(req: TradeDropInput, t: Transaction) {
  const value = validate(req, schema);

  // Remove from roster
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!theentry) { throw uError('No entry found', 404); }

  const theplayer = value.body.nflplayerID;
  const isOnTeam = isPlayerOnRoster(theentry, theplayer);
  if (!isOnTeam) { throw uError('Player is not on roster', 406); }

  theentry[isOnTeam] = null;

  // How much to add to point total
  const playerdata = await NFLPlayer.findByPk(theplayer);
  if (!playerdata || !playerdata.active) { throw uError('Player not found', 404); }

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
  if (value.body.price) {
    if (gamedata.phase !== 'mid') throw uError("Can't trade before or after games", 406);
    tradeprice = value.body.price;
  } else {
    if (gamedata.phase !== 'pre') throw uError("Can't drop during or after games", 406);
    if (!playerdata.preprice) throw uError('Player has no preprice', 500);
    tradeprice = playerdata.preprice;
  }

  theentry.pointtotal += tradeprice;
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
  return theentry;
}

export default tradeDrop;
