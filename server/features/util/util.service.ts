import logger from '../../utilities/logger';

import { isUError, uError } from './util';

interface ErrorRespType {
  status: number,
  message: string,
}
interface ResponseMapType {
  default: ErrorRespType,
  [key: string]: ErrorRespType,
}

interface SequelizeError {
  parent: {
    constraint: string
  },
  [key: string]: unknown
}
const isSeqError = (item: unknown): item is SequelizeError => !!(item as SequelizeError)?.parent?.constraint;

export interface ServiceInput {
  user: number,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
}

/**
 * Handle errors in services
 * Takes a map that determines message and status based on error.
 * Passes UErrors through directly.
 */
export default function errorHandler(responseMap: ResponseMapType) {
  return function errorHandlerInner(err: unknown) {
    if (isUError(err)) throw err;

    if (isSeqError(err)) {
      const errmess = err.parent?.constraint;
      const out = responseMap[errmess];
      if (out) throw uError(out.message, out.status);
    }

    logger.error(`Unknown error: ${err}`);
    const outmess = (responseMap.default || 'Unexpected error');
    throw uError(outmess.message, (outmess.status || 500));
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceType = (inp: any) => Promise<any>;
