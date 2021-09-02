const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Entry } = require('../../../models');
const { canUserSeeContest, errorHandler } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');
const { get } = require('../../../db/redis');

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
    const theweek = await get.CurrentWeek();
    if (theweek !== thecontest.nflweek) u.Error('Incorrect week', 406);
    obj.pointtotal = thecontest.budget;
    return Entry.create(obj, u.tobj(t)).then(u.dv);
  })
    .catch(errorHandler({
      default: ['Entry could not be created', 500],
      Entries_pkey: ['An entry already exists', 406],
    }));
}

module.exports = createEntry;
