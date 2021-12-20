import Joi from 'joi';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';

import tradeDrop from './tradeDrop.service';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    price: Joi.any().forbidden().messages({
      'any.unknown': 'Price not allowed in pretrade',
    }),
  }).required(),
});

interface PreTradeDropInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    nflplayerID: number,
    price: never,
  }
}

// Try to add within a transaction, errors will rollback
async function preTradeDrop(req: PreTradeDropInput) {
  const value: PreTradeDropInput = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeDrop(value, t))
    .catch(errorHandler({
      default: { message: 'Could not drop player', status: 500 },
    }));
}

export default preTradeDrop;
