const Joi = require('joi');

const config = require('../../../config');
const u = require('../../util/util');

const sequelize = require('../../../db');
const { Contest } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueID,
  }).required(),
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      'string.base': 'Name is invalid',
      'any.required': 'Please specify a name',
    }),
    budget: Joi.number().integer().greater(0).required()
      .messages({
        'number.base': 'Budget is invalid',
        'number.integer': 'Budget is invalid',
        'number.greater': 'Budget must be greater than 0',
        'any.required': 'Please specify a budget',
      }),
  }).required(),
});

// Get info for a specific contest
function createContest(req) {
  const value = u.validate(req, schema);
  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await canUserSeeLeague(t, value.user, value.params.leagueID);
    if (theleague.ispublic) { u.Error('Cannot create contests in a public league', 403); }
    if (value.user !== theleague.adminId) { u.Error('Must be league admin to make new contests', 403); }
    return Contest.create({
      name: value.body.name,
      nflweek: config.currentNFLWeek,
      LeagueId: theleague.id,
      budget: value.body.budget,
    }, u.tobj(t)).catch((err) => {
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    });
  });
}

module.exports = createContest;
