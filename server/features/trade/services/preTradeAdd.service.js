const Joi = require('joi');

const sequelize = require('../../../db');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');
const { getGamePhase } = require('../../util/util.service');

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
  }).required(),
});

// Try to add within a transaction, errors will rollback
async function preTradeAdd(req) {
  const value = u.validate(req, schema);

  const phase = await getGamePhase();
  if (phase !== 'pre') {
    u.Error("Can't add during or after games", 406);
  }

  return sequelize.transaction(isoOption, async (t) => tradeAdd(value, t)
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    }));
}

module.exports = preTradeAdd;
