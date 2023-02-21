import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import User from '../user.model';

import type { AccountOutputType } from '../../../../types/api/account.api';

const schema = Joi.object<GetAccountInput>({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

interface GetAccountInput extends ServiceInput {
  params: Record<string, never>,
  body: Record<string, never>,
}

/** Load a user's account */
async function getAccount(req: GetAccountInput): Promise<AccountOutputType> {
  const value = validate(req, schema);
  const theuser = await User.findByPk(value.user);
  if (!theuser) { throw uError('User not found', 404); }
  return theuser;
}

export default getAccount;
