// Set up models with associations
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const mcontest = require('./features/contest/contest.model');
const mleague = require('./features/league/league.model');
const mmembership = require('./features/membership/membership.model');
const mentry = require('./features/entry/entry.model');
const mnfldivision = require('./features/nfldivision/nfldivision.model');
const mnflplayer = require('./features/nflplayer/nflplayer.model');
const mnflposition = require('./features/nflposition/nflposition.model');
const mnflteam = require('./features/nflteam/nflteam.model');
const moffer = require('./features/offer/offer.model');
const mprotectedmatch = require('./features/protectedmatch/protectedmatch.model');
const mpricehistory = require('./features/pricehistory/pricehistory.model');
const mrosterposition = require('./features/rosterposition/rosterposition.model');
const mtrade = require('./features/trade/trade.model');
const muser = require('./features/user/user.model');

const Contest = mcontest(sequelize, DataTypes);
const League = mleague(sequelize, DataTypes);
const Membership = mmembership(sequelize, DataTypes);
const Entry = mentry(sequelize, DataTypes);
const NFLDivision = mnfldivision(sequelize, DataTypes);
const NFLPlayer = mnflplayer(sequelize, DataTypes);
const NFLPosition = mnflposition(sequelize, DataTypes);
const NFLTeam = mnflteam(sequelize, DataTypes);
const Offer = moffer(sequelize, DataTypes);
const ProtectedMatch = mprotectedmatch(sequelize, DataTypes);
const PriceHistory = mpricehistory(sequelize, DataTypes);
const RosterPosition = mrosterposition(sequelize, DataTypes);
const Trade = mtrade(sequelize, DataTypes);
const User = muser(sequelize, DataTypes);

League.hasMany(Membership);
Membership.belongsTo(League);

User.hasMany(Membership);
Membership.belongsTo(User);

Contest.hasMany(Entry);
Entry.belongsTo(Contest);

User.hasMany(Entry);
Entry.belongsTo(User);

User.hasMany(Offer);
Offer.belongsTo(User);

Trade.belongsTo(Offer, { as: 'bid', foreignKey: 'bidId' });
Trade.belongsTo(Offer, { as: 'ask', foreignKey: 'askId' });

ProtectedMatch.belongsTo(Offer, { as: 'existing', foreignKey: 'existingId' });
ProtectedMatch.belongsTo(Offer, { as: 'new', foreignKey: 'newId' });

NFLPlayer.belongsTo(NFLTeam);
NFLTeam.hasMany(NFLPlayer);

NFLPlayer.belongsTo(NFLPosition);
NFLPosition.hasMany(NFLPlayer);

module.exports = {
  League,
  Membership,
  Contest,
  Entry,
  NFLDivision,
  NFLPlayer,
  NFLPosition,
  NFLTeam,
  Offer,
  ProtectedMatch,
  PriceHistory,
  RosterPosition,
  Trade,
  User,
};

module.exports.sequelize = sequelize;
