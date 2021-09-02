const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const sequelize = require('../../../db');

const tradeDrop = require('./tradeDrop.service');
const { errorHandler } = require('../../util/util.service');

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
    price: Joi.any().forbidden().messages({
      'any.unknown': 'Price not allowed in pretrade',
    }),
  }).required(),
});

// Try to add within a transaction, errors will rollback
async function preTradeDrop(req) {
  const value = u.validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeDrop(value, t))
    .catch(errorHandler({
      default: ['Could not drop player', 500],
    }));
}

module.exports = preTradeDrop;
