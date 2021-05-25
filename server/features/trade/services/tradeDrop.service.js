const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Entry, NFLPlayer, NFLTeam } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
    price: Joi.number().integer().greater(0).optional()
      .messages({
        'number.base': 'Price is invalid',
        'number.integer': 'Price is invalid',
        'number.greater': 'Price must be greater than 0',
      }),
  }).required(),
});

async function tradeDrop(req, t) {
  const value = u.validate(req, schema);

  // Remove from roster
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!theentry) { u.Error('No entry found', 404); }

  const isOnTeam = u.isPlayerOnRoster(theentry, value.body.nflplayerID);
  if (!isOnTeam) { u.Error('Player is not on roster', 406); }
  theentry[isOnTeam] = null;

  // How much to add to point total
  const playerdata = await NFLPlayer.findByPk(value.body.nflplayerID, {
    include: [{ model: NFLTeam }],
    transaction: t,
  }).then((d) => d.dataValues);

  if (value.body.price) {
    theentry.pointtotal += value.body.price;
  } else {
    if (playerdata.NFLTeam.gamePhase !== 'pre') {
      u.Error("Can't drop during or after games", 406);
    }
    theentry.pointtotal += playerdata.preprice;
  }

  await theentry.save({ transaction: t });

  return u.dv(theentry);
}

module.exports = tradeDrop;
