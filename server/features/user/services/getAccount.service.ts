import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import { User } from '../../../models';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

interface GetAccountInput extends ServiceInput {
  params: Record<string, never>,
  body: Record<string, never>,
}

async function getAccount(req: GetAccountInput) {
  const value = validate(req, schema);
  const theuser = await User.findByPk(value.user).then(dv);
  if (!theuser) { uError('User not found', 404); }
  return theuser;
}

export default getAccount;
