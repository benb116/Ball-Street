import Joi from 'joi';

import { Op, Transaction } from 'sequelize';
import {
  dv, validate, uError, isPlayerOnRoster,
} from '../../util/util';
import validators from '../../util/util.schema';

import { Entry, NFLPlayer, NFLGame } from '../../../models';
import { ServiceInput } from '../../util/util.service';

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
  const value = validate(req, schema);

  const theplayer = value.body.nflplayerID;

  // Remove from roster
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!theentry) { uError('No entry found', 404); }

  const isOnTeam = isPlayerOnRoster(theentry, theplayer);
  if (!isOnTeam) { uError('Player is not on roster', 406); }
  theentry[isOnTeam] = null;

  // How much to add to point total
  const playerdata = await NFLPlayer.findByPk(theplayer, { transaction: t }).then(dv);
  if (!playerdata || !playerdata.active) { uError('Player not found', 404); }

  // Get player price and position
  const gamedata = await NFLGame.findOne({
    where: {
      [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
      week: Number(process.env.WEEK),
    },
  }, { transaction: t }).then(dv);
  if (!gamedata) uError('Could not find game data for this player', 404);

  if (value.body.price) {
    if (gamedata.phase !== 'mid') {
      uError("Can't trade before or after games", 406);
    }
    theentry.pointtotal += value.body.price;
  } else {
    if (gamedata.phase !== 'pre') {
      uError("Can't drop during or after games", 406);
    }
    theentry.pointtotal += playerdata.preprice;
  }

  await theentry.save({ transaction: t });

  return dv(theentry);
}

export default tradeDrop;
