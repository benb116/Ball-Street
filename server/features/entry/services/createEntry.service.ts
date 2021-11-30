const Joi = require('joi');

const u = require('../../util/util');

const { Entry, Contest } = require('../../../models');
const { errorHandler } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
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
  const thecontest = await Contest.findByPk(value.params.contestID).then(u.dv);
  if (!thecontest) { u.Error('No contest found', 404); }
  const theweek = Number(process.env.WEEK);
  if (theweek !== thecontest.nflweek) u.Error('Incorrect week', 406);
  obj.pointtotal = thecontest.budget;
  return Entry.create(obj).then(u.dv)
    .catch(errorHandler({
      default: ['Entry could not be created', 500],
      Entries_pkey: ['An entry already exists', 406],
    }));
}

module.exports = createEntry;
