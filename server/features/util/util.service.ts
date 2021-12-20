import logger from '../../utilities/logger';
import { uError } from './util';

interface ErrorRespType {
  status: number,
  message: string,
}

export interface ServiceInput {
  user: number,
  params: Record<string, any>,
  body: Record<string, any>,
}

// Handle errors in services
// Takes a map that determines message and status based on error
// Passes UErrors through directly.
export default function errorHandler(responseMap: Record<string, ErrorRespType>) {
  return function errorHandlerInner(err: any) {
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
