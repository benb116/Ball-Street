const Joi = require('joi');

const { Op } = require('sequelize');
const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Entry, NFLPlayer, NFLGame } = require('../../../models');

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
    rosterposition: Joi.string().alphanum().optional().messages({
      'string.base': 'Position is invalid',
    }),
  }).required(),
});

// Add a player within a transaction, but don't commit
async function tradeAdd(req, t) {
  const value = u.validate(req, schema);

  const theplayer = value.body.nflplayerID;
  // Get user entry
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!theentry) { u.Error('No entry found', 404); }
  // Determine if user already has player on roster
  const isOnTeam = u.isPlayerOnRoster(theentry, theplayer);
  if (isOnTeam) { u.Error('Player is on roster', 406); }

  const pts = theentry.dataValues.pointtotal;
  // console.log("POINTS", pts);

  // Get player price and position
  const playerdata = await NFLPlayer.findByPk(theplayer, {
    transaction: t,
  }).then(u.dv);

  const playerType = playerdata.NFLPositionId;
  if (value.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = u.isInvalidSpot(playerType, value.body.rosterposition);
    if (isinvalid) { u.Error(isinvalid, 406); }
    // Is it an empty one?
    if (theentry[value.body.rosterposition] !== null) {
      u.Error('There is a player in that spot', 406);
    }
    theentry[value.body.rosterposition] = theplayer;
  } else {
    // Find an open spot
    const isOpen = u.isOpenRoster(theentry, playerType);
    if (!isOpen) { u.Error('There are no open spots', 406); }
    theentry[isOpen] = theplayer;
  }

  // Get player price and position
  const gamedata = await NFLGame.findOne({
    where: {
      [Op.or]: [{ HomeId: playerdata.NFLTeamId }, { AwayId: playerdata.NFLTeamId }],
    },
  }, { transaction: t }).then(u.dv);
    // console.log("PDATA", playerdata);

  if (!value.body.price) {
    if (gamedata.phase !== 'pre') {
      u.Error("Can't add during or after games", 406);
    }
  } else if (gamedata.phase !== 'mid') {
    u.Error("Can't trade before or after games", 406);
  }

  const tradeprice = value.body.price || playerdata.preprice;
  // Checks
  if (!tradeprice) { u.Error('Player has no preprice', 500); }
  if (tradeprice > pts) { u.Error("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.pointtotal -= tradeprice;

  await theentry.save({ transaction: t });

  return theentry;
}

module.exports = tradeAdd;
