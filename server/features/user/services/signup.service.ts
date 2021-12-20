import bcrypt from 'bcrypt';
import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler from '../../util/util.service';

import genVerify from './genVerify.service';

import User from '../user.model';

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name is invalid',
    'any.required': 'Name is required',
  }),
  email: validators.email,
  password: validators.password,
  skipVerification: Joi.boolean().default(false),
});

interface SignupInput {
  name: string,
  email: string,
  password: string,
  skipVerification: boolean,
}

async function signup(req: SignupInput) {
  const value: SignupInput = validate(req, schema);
  const {
    name, email, password, skipVerification,
  } = value;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({
      name, email, pwHash: hash, verified: skipVerification,
    }).then(dv);
    if (!theuser) { uError('User could not be created', 500); }
    if (!skipVerification) return await genVerify({ id: theuser.id, email: theuser.email });
    return {
      needsVerification: false, id: theuser.id, email: theuser.email, name: theuser.name,
    };
  } catch (err) {
    const f = errorHandler({
      default: { message: 'Could not create user', status: 500 },
      Users_email_key: { message: 'An account with that email already exists', status: 406 },
      'User.name cannot be null': { message: 'Please enter a name', status: 406 },
    });
    return f(err);
  }
}
export default signup;
