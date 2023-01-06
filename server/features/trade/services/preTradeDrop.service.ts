import Joi from 'joi';

import { preTradeInput, PreTradeInputType } from '../../../../types/api/entry.api';
import sequelize from '../../../db';
import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import tradeDrop from './tradeDrop.service';

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

interface PreTradeDropInput extends ServiceInput {
  params: { contestID: number },
  body: PreTradeInputType
}

/** Try to drop within a transaction, errors will rollback */
async function preTradeDrop(req: PreTradeDropInput) {
  const value: PreTradeDropInput = validate(req, schema);

  return sequelize.transaction(async (t) => tradeDrop(value, t))
    .catch(errorHandler({
      default: { message: 'Could not drop player', status: 500 },
    }));
}

export default preTradeDrop;
