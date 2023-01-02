import Joi from 'joi';

import sequelize from '../../../db';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import tradeAdd from './tradeAdd.service';

import { preTradeInput, PreTradeInputType } from '../../../../types/api/entry.api';

const bodySchema = Joi.object().keys({
  nflplayerID: validators.nflplayerID,
  price: Joi.any().forbidden().messages({ 'any.unknown': 'Price not allowed in pretrade' }),
}).required();
validate(preTradeInput, bodySchema);

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: bodySchema,
});

interface PreTradeAddInput extends ServiceInput {
  params: { contestID: number },
  body: PreTradeInputType
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
