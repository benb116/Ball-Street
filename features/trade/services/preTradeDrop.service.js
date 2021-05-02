const sequelize = require('../../../db');

const tradeDrop = require('./tradeDrop.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

// Try to add within a transaction, errors will rollback
function preTradeDrop(req) {
  return sequelize.transaction(isoOption, async (t) => tradeDrop(req, t));
}

module.exports = preTradeDrop;
