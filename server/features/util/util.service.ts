const logger = require('../../utilities/logger');
const u = require('./util');

function errorHandler(responseMap) {
  return function errorHandlerInner(err) {
    const outmess = (responseMap.default || 'Unexpected error');
    if (!err) return u.Error(outmess[0], (outmess[1] || 500));
    if (err.status) throw err;
    const errmess = err.parent?.constraint;
    const out = responseMap[errmess];
    if (out) return u.Error(out[0], out[1]);
    logger.error(`Unknown error: ${err}`);
    return u.Error(outmess[0], (outmess[1] || 500));
  };
}

module.exports = {
  errorHandler,
};
