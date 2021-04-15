// Trade service covers:
// Adding and dropping pregame
// Submitting and cancelling offers
// const { Transaction } = require('sequelize');
const sequelize = require('../db');
const {
  Entry, NFLPlayer, Offer, Trade, User,
} = require('../models');
const u = require('../util');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
  tradeAdd,
  tradeDrop,
  preTradeAdd,
  preTradeDrop,
  getUserTrades,
};

// Adding and dropping are two separate processes
// Splitting them supports pregame independent trading
// For in-game trading, need to see if both add and drop can be done before committing transaction
// So separate functions will run through the process without committing,
// then both can be committed together if there were no issues

// Add a player within a transaction, but don't commit
async function tradeAdd(req, t) {
  const theplayer = req.body.nflplayerID;
  // Get user entry
  const theentry = await Entry.findOne({
    where: {
      UserId: req.session.user.id,
      ContestId: req.body.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

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

  const tradeprice = req.body.price || playerdata.preprice;
  // Checks
  if (!tradeprice) { u.Error('Player has no preprice', 500); }
  if (tradeprice > pts) { u.Error("User doesn't have enough points", 402); }

  // Deduct cost from points
  theentry.pointtotal -= tradeprice;

  const playerType = playerdata.NFLPositionId;
  if (req.body.rosterposition) { // If a roster position was specified
    // Is it a valid one?
    const isinvalid = u.isInvalidSpot(playerType, req.body.rosterposition);
    if (isinvalid) { u.Error(isinvalid); }
    // Is it an empty one?
    if (theentry[req.body.rosterposition] !== null) {
      u.Error('There is a player in that spot', 406);
    }
    theentry[req.body.rosterposition] = theplayer;
  } else {
    // Find an open spot
    const isOpen = u.isOpenRoster(theentry, playerType);
    if (!isOpen) { u.Error('There are no open spots', 406); }
    theentry[isOpen] = theplayer;
  }
  await theentry.save({ transaction: t });

  return 0;
}

// Drop a player within a transaction, but don't commit
async function tradeDrop(req, t) {
  // Remove from roster
  const theentry = await Entry.findOne({
    where: {
      UserId: req.session.user.id,
      ContestId: req.body.contestID,
    },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  const isOnTeam = u.isPlayerOnRoster(theentry, req.body.nflplayerID);
  if (!isOnTeam) { u.Error('Player is not on roster', 406); }
  theentry[isOnTeam] = null;

  if (req.body.price) {
    theentry.pointtotal += req.body.price;
  } else {
    // How much to add to point total
    const preprice = await NFLPlayer.findByPk(req.body.nflplayerID, {
      attributes: ['preprice'],
      transaction: t,
    }).then((d) => d.dataValues.preprice);

    theentry.pointtotal += preprice;
  }

  await theentry.save({ transaction: t });

  return 0;
}

// Try to add within a transaction, errors will rollback
function preTradeAdd(req) {
  return sequelize.transaction(isoOption, async (t) => tradeAdd(req, t));
}

// Try to drop within a transaction, errors will rollback
function preTradeDrop(req) {
  return sequelize.transaction(isoOption, async (t) => tradeDrop(req, t));
}

function getUserTrades(req) {
  return Trade.findAll({
    include: [
      {
        model: User,
        where: {
          id: req.session.user.id,
        },
      },
      {
        model: Offer,
        where: {
          ContestId: req.params.contestID,
        },
      },
    ],
  }).then(u.dv);
}
