import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import genVerify from './genVerify.service';

import User from '../user.model';
import { LoginInput, inputLogin } from '../../../../types/api/user.api';

const schema = Joi.object({
  email: validators.email,
  password: validators.password,
});
validate(inputLogin, schema);

async function login(req: LoginInput) {
  const value: LoginInput = validate(req, schema);
  const { email, password } = value;

  const theuser = await User.scope('withPassword').findOne({ where: { email } });
  if (!theuser) { return uError('Wrong username or password', 401); }
  const match = await bcrypt.compare(password, theuser.pwHash);
  if (!match) { return uError('Wrong username or password', 401); }
  if (!theuser.verified) {
    return genVerify({ id: theuser.id, email });
  }
  return {
    needsVerification: false, id: theuser.id, email: theuser.email, name: theuser.name, cash: theuser.cash,
  };
}

export default login;
