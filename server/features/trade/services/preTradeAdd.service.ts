import Joi from 'joi'

import sequelize from '../../../db'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'
import { errorHandler } from '../../util/util.service'

import tradeAdd from './tradeAdd.service'

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
    rosterposition: Joi.string().alphanum().optional().messages({
      'string.base': 'Position is invalid',
    }),
    price: Joi.any().forbidden().messages({
      'any.unknown': 'Price not allowed in pretrade',
    }),
  }).required(),
});

// Try to add within a transaction, errors will rollback
async function preTradeAdd(req) {
  const value = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeAdd(value, t))
    .catch(errorHandler({
      default: ['Could not add player', 500],
    }));
}

export default preTradeAdd;
