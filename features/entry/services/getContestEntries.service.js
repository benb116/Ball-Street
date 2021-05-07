const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Entry, User } = require('../../../models');
const { canUserSeeContest } = require('../../util/util.service');
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
function getContestEntries(req) {
  const value = u.validate(req, schema);

  // Only show a specific contest's data if user is in contest's league
  return sequelize.transaction(isoOption, async (t) => {
    const [theleague] = await canUserSeeContest(
      t,
      value.user,
      value.params.leagueID,
      value.params.contestID,
    );

    const includeObj = (theleague.ispublic ? {} : { model: User });
    return Entry.findAll({ where: { ContestId: value.params.contestID }, includeObj });
  })
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    });
}

module.exports = getContestEntries;
