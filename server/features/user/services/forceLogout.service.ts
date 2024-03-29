/* eslint-disable no-restricted-syntax */
import { SessionData } from 'express-session';
import Joi from 'joi';

import { client } from '../../../db/redis';
import logger from '../../../utilities/logger';
import { uError, validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object<ForceLogoutInput>({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

interface ForceLogoutInput extends ServiceInput {
  params: Record<string, never>,
  body: Record<string, never>,
}

/** Force a user to logout by deleting all session info */
async function forceLogout(req: ForceLogoutInput) {
  const value = validate(req, schema);

  const iterator = client.scanIterator({
    MATCH: 'sess:*',
  });
  try {
    for await (const key of iterator) {
      const rawValue = await client.get(key);
      if (rawValue) {
        const sessionObject: SessionData = JSON.parse(rawValue);
        if (sessionObject.user?.id === value.user) {
          client.del(key);
        }
      }
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw uError('Could not force logout', 500);
  }
}

export default forceLogout;
