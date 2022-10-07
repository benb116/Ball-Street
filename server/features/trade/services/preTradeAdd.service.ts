import Joi from 'joi';
import { RPosType } from '../../../config';

import sequelize from '../../../db';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import tradeAdd from './tradeAdd.service';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    rosterposition: Joi.string().alphanum().optional().messages({
      'string.base': 'Position is invalid',
    }),
    price: Joi.any().forbidden().messages({
      'any.unknown': 'Price not allowed in pretrade',
    }),
  }).required(),
});

interface PreTradeAddInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    nflplayerID: number,
    rosterposition?: RPosType,
    price: never,
  }
}

/** Try to add within a transaction, errors will rollback */
async function preTradeAdd(req: PreTradeAddInput) {
  const value: PreTradeAddInput = validate(req, schema);

  return sequelize.transaction(async (t) => tradeAdd(value, t))
    .catch(errorHandler({
      default: { message: 'Could not add player', status: 500 },
    }));
}

export default preTradeAdd;
