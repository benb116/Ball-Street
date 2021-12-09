import bcrypt from 'bcrypt';
import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import { User } from '../../../models';
import genVerify from './genVerify.service';

const schema = Joi.object({
  email: validators.email,
  password: validators.password,
});

interface LoginInput {
  email: string,
  password: string,
}

async function login(req: LoginInput) {
  const { email, password } = validate(req, schema);

  const theuser = await User.scope('withPassword').findOne({ where: { email } });
  if (!theuser) { uError('Wrong username or password', 401); }
  const match = await bcrypt.compare(password, theuser.pwHash);
  if (!match) { uError('Wrong username or password', 401); }
  if (!theuser.verified) {
    return genVerify({ email });
  }
  return {
    needsVerification: false, id: theuser.id, email: theuser.email, name: theuser.name,
  };
}

export default login;
