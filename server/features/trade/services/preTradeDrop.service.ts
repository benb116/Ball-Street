import Joi from 'joi';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';

import sequelize from '../../../db';

import tradeDrop from './tradeDrop.service';
import { errorHandler } from '../../util/util.service';

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

// Try to add within a transaction, errors will rollback
async function preTradeDrop(req) {
  const value = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeDrop(value, t))
    .catch(errorHandler({
      default: ['Could not drop player', 500],
    }));
}

export default preTradeDrop;
