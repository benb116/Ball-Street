// Offer service covers:
// Creating and deleting an offer
// Getting info about a user's offers across contests
const Queue = require('bull');
const sequelize = require('../../db');
const {
  Offer, Entry, NFLPlayer,
} = require('../../models');
const u = require('../util/util');
const config = require('../../config');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const offerQueue = new Queue('offer-queue');
const protectedQueue = new Queue('protected-queue');

function getUserOffers(req) {
  return Offer.findAll({
    where: {
      UserId: req.session.user.id,
      ContestId: req.params.contestID,
      filled: false,
      cancelled: false,
    },
  }).then(u.dv).catch(console.error);
}

function createOffer(req) {
  const obj = req.body.offerobj;
  obj.userID = req.session.user.id;
  return sequelize.transaction(isoOption, async (t) => {
    // Find user's entry
    const theentry = await Entry.findOne({
      where: {
        UserId: obj.userID,
        ContestId: req.params.contestID,
      },
    }, u.tobj(t));

    // Player should be in entry for ask, not for bid
    const isOnTeam = u.isPlayerOnRoster(theentry, obj.nflplayerID);
    if (!obj.isbid) {
      if (!isOnTeam) { u.Error('Player is not on roster', 404); }
    } else {
      if (isOnTeam) { u.Error('Player is on roster already', 409); }

      const pts = theentry.dataValues.pointtotal;
      if (obj.price > pts) { u.Error("User doesn't have enough points to offer", 402); }

      const playerdata = await NFLPlayer.findByPk(obj.nflplayerID, {
        attributes: ['NFLPositionId'],
        transaction: t,
      }).then(u.dv);
      // Only allow offer if there's currently room on the roster
      // TODO make linked offers? I.e. sell player at market price to make room for other player
      if (!u.isOpenRoster(theentry, playerdata.NFLPositionId)) { u.Error('There are no spots this player could fit into', 409); }
    }

    return Offer.create({
      UserId: obj.userID,
      ContestId: req.params.contestID,
      NFLPlayerId: obj.nflplayerID,
      isbid: obj.isbid,
      price: obj.price,
      protected: obj.protected || config.DefaultProtected,
    }, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    }).catch((err) => {
      console.log(err);
      u.Error(err, 406);
    });
  })
    .then(u.dv).then((offer) => {
      console.log('Add offer to queue');
      offerQueue.add(offer);
      return offer;
    });
}

function cancelOffer(req) {
  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(isoOption, async (t) => {
    const o = await Offer.findByPk(req.body.offerID, u.tobj(t));
    if (!o) { u.Error('No offer found', 404); }
    if (o.filled) { u.Error('Offer already filled', 406); }
    o.cancelled = true;
    await o.save({ transaction: t });
    return o;
  }).then(u.dv).then((offer) => {
    console.log('Add offer to queue (to update prices)');
    offerQueue.add(offer);
    return offer;
  });
}

async function getOfferBacklog() {
  return Promise.all([
    offerQueue.getJobCounts(),
    protectedQueue.getJobCounts(),
  ]);
}

module.exports = {
  getUserOffers,
  createOffer,
  cancelOffer,
  getOfferBacklog,
};
