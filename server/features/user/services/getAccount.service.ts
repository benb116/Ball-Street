import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'

import { User } from '../../../models'

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

async function getAccount(req) {
  const value = validate(req, schema);
  const theuser = await User.findByPk(value.user).then(dv);
  if (!theuser) { uError('User not found', 404); }
  return theuser;
}

export default getAccount;
