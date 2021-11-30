import bcrypt from 'bcrypt';
import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import { User } from '../../../models';
import genVerify from './genVerify.service';
import { errorHandler } from '../../util/util.service';

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name is invalid',
    'any.required': 'Name is required',
  }),
  email: validators.email,
  password: validators.password,
  skipVerification: Joi.boolean().default(false),
});

async function signup(req) {
  const {
    name, email, password, skipVerification,
  } = validate(req, schema);
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({
      name, email, pwHash: hash, verified: skipVerification,
    }).then(dv);
    if (!theuser) { uError('User could not be created', 500); }
    if (!skipVerification) return await genVerify({ email: theuser.email });
    return { id: theuser.id, email: theuser.email, name: theuser.name };
  } catch (err) {
    const f = errorHandler({
      default: ['Could not create user', 500],
      Users_email_key: ['An account with that email already exists', 406],
      'User.name cannot be null': ['Please enter a name', 406],
    });
    return f(err);
  }
}
export default signup;
