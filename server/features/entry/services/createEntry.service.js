const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Entry } = require('../../../models');
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
async function createEntry(req) {
  const value = u.validate(req, schema);

  const obj = {};
  obj.UserId = value.user;
  obj.ContestId = value.params.contestID;
  // Only allow if user is in contest's league
  return sequelize.transaction(isoOption, async (t) => {
    const [, thecontest] = await canUserSeeContest(
      t, value.user, value.params.leagueID, value.params.contestID,
    );
    obj.pointtotal = thecontest.budget;
    return Entry.create(obj, u.tobj(t)).then(u.dv);
  })
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      if (errmess === 'Entries_pkey') { u.Error('An entry already exists', 406); }
      u.Error(errmess, 406);
    });
}

module.exports = createEntry;
