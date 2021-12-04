import logger from '../../utilities/logger';
import { uError } from './util';

interface ErrorRespType {
  status: number,
  message: string,
}
export function errorHandler(responseMap: Record<string, ErrorRespType>) {
  return function errorHandlerInner(err) {
    const outmess = (responseMap.default || 'Unexpected error');
    if (!err) return uError(outmess.message, (outmess.status || 500));
    if (err.status) throw err;
    const errmess = err.parent?.constraint;
    const out = responseMap[errmess];
    if (out) return uError(out.message, out.status);
    logger.error(`Unknown error: ${err}`);
    return uError(outmess.message, (outmess.status || 500));
  };
}
