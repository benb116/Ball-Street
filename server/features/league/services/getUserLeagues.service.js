const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Membership, League } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

// Get info for a specific contest
function getUserLeagues(req) {
  const value = u.validate(req, schema);

  return Membership.findAll({
    where: { UserId: value.user },
    include: {
      model: League,
      where: {
        ispublic: false,
      },
    },
  }).then(u.dv).then((ships) => ships.map((m) => m.League));
}

module.exports = getUserLeagues;
