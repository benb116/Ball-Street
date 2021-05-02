const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Membership, League, User } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().required(),
  }).required(),
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
  }).required(),
});

async function addMember(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await League.findByPk(value.params.leagueID, u.tobj(t)).then(u.dv);
    if (!theleague) { u.Error('No league found', 404); }

    if (value.user !== theleague.adminId) { u.Error('You are not admin, cannot add new member', 403); }

    const theuser = await User.findOne({ where: { email: value.body.email } }).then(u.dv);
    if (!theuser) { u.Error('No user found', 404); }

    return Membership.create({
      UserId: theuser.id,
      LeagueId: value.params.leagueID,
    }, u.tobj(t))
      .then((mem) => {
        const out = mem;
        out.name = theuser.name;
        return out;
      })
      .catch((err) => u.Error(err.parent.constraint, 406));
  });
}

module.exports = addMember;
