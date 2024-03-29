import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { inputSignup } from '../../../../types/api/user.api';
import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler from '../../util/util.service';
import User from '../user.model';

import genVerify from './genVerify.service';

import type { GenVerifyOutputType, LoginOutputType, SignupInputType } from '../../../../types/api/user.api';

const schema = Joi.object<SignupInputType>({
  name: Joi.string().required().messages({
    'string.base': 'Name is invalid',
    'any.required': 'Name is required',
  }),
  email: validators.email,
  password: validators.password,
  skipVerification: Joi.boolean().default(false),
});
validate(inputSignup, schema);

const saltRounds = 10;

/** Sign up a user and possibly continue verification */
async function signup(req: SignupInputType): Promise<LoginOutputType | GenVerifyOutputType> {
  const value = validate(req, schema);
  const {
    name, email, password, skipVerification,
  } = value;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({
      name, email, pwHash: hash, verified: skipVerification, cash: 0,
    });
    if (!theuser) { throw uError('User could not be created', 500); }
    if (!skipVerification) return await genVerify({ id: theuser.id, email: theuser.email });
    return {
      needsVerification: false, id: theuser.id, email: theuser.email, name: theuser.name, cash: theuser.cash,
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
