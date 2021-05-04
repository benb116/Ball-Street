const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Entry, Contest } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueID,
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function createEntry(req) {
  const value = u.validate(req, schema);

  const obj = {};
  obj.UserId = value.user;
  obj.ContestId = value.params.contestID;
  // Only allow if user is in contest's league
  return sequelize.transaction(isoOption, async (t) => {
    await canUserSeeLeague(t, value.user, value.params.leagueID);
    const contestBudget = await Contest.findByPk(value.params.contestID).then(u.dv)
      .then((c) => c.budget);
    obj.pointtotal = contestBudget;
    return Entry.create(obj, u.tobj(t)).then(u.dv);
  })
    .catch((err) => {
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    });
}

module.exports = createEntry;
