const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const sequelize = require('../../../db');

const tradeDrop = require('./tradeDrop.service');

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
  }).required(),
});

// Try to add within a transaction, errors will rollback
async function preTradeDrop(req) {
  const value = u.validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => tradeDrop(value, t)
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    }));
}

module.exports = preTradeDrop;
