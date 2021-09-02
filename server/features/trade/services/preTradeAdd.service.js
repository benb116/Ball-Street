const Joi = require('joi');

const sequelize = require('../../../db');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');
const { errorHandler } = require('../../util/util.service');

const tradeAdd = require('./tradeAdd.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    rosterposition: Joi.string().alphanum().optional().messages({
      'string.base': 'Position is invalid',
    }),
    price: Joi.any().forbidden().messages({
      'any.unknown': 'Price not allowed in pretrade',
    }),
  }).required(),
});

// Try to add within a transaction, errors will rollback
async function preTradeAdd(req) {
  const value = u.validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeAdd(value, t))
    .catch(errorHandler({
      default: ['Could not add player', 500],
    }));
}

module.exports = preTradeAdd;
