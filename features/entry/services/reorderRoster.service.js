const Joi = require('joi');

const u = require('../../util/util');
const config = require('../../../config');

const sequelize = require('../../../db');
const { Entry } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().required(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().keys({
    pos1: Joi.string().trim().required(),
    pos2: Joi.string().trim().required(),
  }).required(),
});

async function reorderRoster(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    const postype1 = config.Roster[value.body.pos1];
    const postype2 = config.Roster[value.body.pos2];

    if (postype1 === 0 && !config.NFLPosTypes[postype2].canflex) {
      u.Error('Cannot put a non-flex player in a flex position', 406);
    } else if (postype2 === 0 && !config.NFLPosTypes[postype1].canflex) {
      u.Error('Cannot put a non-flex player in a flex position', 406);
    } else if (postype1 !== postype2) {
      u.Error('Cannot put that player in that position', 406);
    }

    await canUserSeeLeague(t, value.user, value.params.leagueID);
    const theentry = await Entry.findOne({
      where: {
        UserId: value.user,
        ContestId: value.params.contestID,
      },
    }, u.tobj(t)).then(u.dv);

    const playerIDin1 = theentry[value.body.pos1];
    const playerIDin2 = theentry[value.body.pos2];

    if (!playerIDin1 && !playerIDin2) {
      u.Error('No players found', 404);
    }

    theentry[value.body.pos1] = playerIDin2;
    theentry[value.body.pos2] = playerIDin1;

    await theentry.save({ transaction: t });
    return theentry;
  })
    .catch((err) => {
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    });
}

module.exports = reorderRoster;
