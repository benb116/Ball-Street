import Joi from 'joi';

import { AccountOutput } from '../../../../types/api/account.api';
import { validate, uError } from '../../util/util';
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
async function getAccount(req: GetAccountInput): Promise<AccountOutput> {
  const value: GetAccountInput = validate(req, schema);
  const theuser = await User.findByPk(value.user);
  if (!theuser) { throw uError('User not found', 404); }
  return theuser;
}

export default getAccount;
