const Joi = require('joi');

const u = require('../../util/util');

const { Entry, NFLPlayer } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().optional(),
    contestID: Joi.string().alphanum().trim().required(),
    nflplayerID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().keys({
    nflplayerID: Joi.string().alphanum().trim().required(),
    rosterposition: Joi.string().alphanum().optional(),
  }).required(),
});

// Add a player within a transaction, but don't commit
async function tradeAdd(req, t) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

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
    attributes: ['preprice', 'NFLPositionId'],
    transaction: t,
  }).then((d) => d.dataValues);
    // console.log("PDATA", playerdata);

  const tradeprice = value.price || playerdata.preprice;
  // Checks
  if (!tradeprice) { u.Error('Player has no preprice', 500); }
  if (tradeprice > pts) { u.Error("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.pointtotal -= tradeprice;

  const playerType = playerdata.NFLPositionId;
  if (value.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = u.isInvalidSpot(playerType, value.body.rosterposition);
    if (isinvalid) { u.Error(isinvalid); }
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
  await theentry.save({ transaction: t });

  return theentry;
}

module.exports = tradeAdd;
