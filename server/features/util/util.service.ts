import logger from '../../utilities/logger'
import { uError } from './util'

export const errorHandler = function errorHandler(responseMap) {
  return function errorHandlerInner(err) {
    const outmess = (responseMap.default || 'Unexpected error');
    if (!err) return uError(outmess[0], (outmess[1] || 500));
    if (err.status) throw err;
    const errmess = err.parent?.constraint;
    const out = responseMap[errmess];
    if (out) return uError(out[0], out[1]);
    logger.error(`Unknown error: ${err}`);
    return uError(outmess[0], (outmess[1] || 500));
  };
}
