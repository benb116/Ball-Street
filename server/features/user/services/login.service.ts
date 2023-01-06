import bcrypt from 'bcryptjs';
import Joi from 'joi';

import {
  LoginInput, inputLogin, LoginOutput, GenVerifyOutput,
} from '../../../../types/api/user.api';
import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import User from '../user.model';

import genVerify from './genVerify.service';

const schema = Joi.object({
  email: validators.email,
  password: validators.password,
});
validate(inputLogin, schema);

/** Log a user in and possibly continue verification */
async function login(req: LoginInput): Promise<LoginOutput | GenVerifyOutput> {
  const value: LoginInput = validate(req, schema);
  const { email, password } = value;

  const theuser = await User.scope('withPassword').findOne({ where: { email } });
  if (!theuser) { throw uError('Wrong username or password', 401); }
  const match = await bcrypt.compare(password, theuser.pwHash);
  if (!match) { throw uError('Wrong username or password', 401); }
  if (!theuser.verified) {
    return genVerify({ id: theuser.id, email });
  }
  return {
    needsVerification: false, id: theuser.id, email: theuser.email, name: theuser.name, cash: theuser.cash,
  };
}

export default login;
