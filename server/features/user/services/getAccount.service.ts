import Joi from 'joi';

import { uError, validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import User from '../user.model';

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

interface GetAccountInput extends ServiceInput {
  params: Record<string, never>,
  body: Record<string, never>,
}

/** Load a user's account */
async function getAccount(req: GetAccountInput) {
  const value: GetAccountInput = validate(req, schema);
  const theuser = await User.findByPk(value.user);
  if (!theuser) { return uError('User not found', 404); }
  return theuser;
}

export default getAccount;
