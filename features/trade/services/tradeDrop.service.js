const Joi = require('joi');

const u = require('../../util/util');

const { Entry, NFLPlayer } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().optional(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().keys({
    nflplayerID: Joi.string().alphanum().trim().required(),
  }).required(),
});

async function tradeDrop(req, t) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  // Remove from roster
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  const isOnTeam = u.isPlayerOnRoster(theentry, value.body.nflplayerID);
  if (!isOnTeam) { u.Error('Player is not on roster', 406); }
  theentry[isOnTeam] = null;

  if (value.price) {
    theentry.pointtotal += value.price;
  } else {
    // How much to add to point total
    const preprice = await NFLPlayer.findByPk(value.body.nflplayerID, {
      attributes: ['preprice'],
      transaction: t,
    }).then((d) => d.dataValues.preprice);

    theentry.pointtotal += preprice;
  }

  await theentry.save({ transaction: t });

  return theentry;
}

module.exports = tradeDrop;
