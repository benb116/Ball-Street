const sequelize = require('../../../db');

const tradeAdd = require('./tradeAdd.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

// Try to add within a transaction, errors will rollback
function preTradeAdd(req) {
  return sequelize.transaction(isoOption, async (t) => tradeAdd(req, t));
}

module.exports = preTradeAdd;
