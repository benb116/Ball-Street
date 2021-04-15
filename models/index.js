const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const preModelcontest = require('./contest.model');
const preModelleague = require('./league.model');
const preModelmembership = require('./membership.model');
const preModelentry = require('./entry.model');
const preModelnfldivision = require('./nfldivision.model');
const preModelnflplayer = require('./nflplayer.model');
const preModelnflposition = require('./nflposition.model');
const preModelnflteam = require('./nflteam.model');
const preModeloffer = require('./offer.model');
const preModelprotectedmatch = require('./protectedmatch.model');
const preModelrosterposition = require('./rosterposition.model');
const preModeltrade = require('./trade.model');
const preModeluser = require('./user.model');

const Contest = preModelcontest(sequelize, DataTypes);
const League = preModelleague(sequelize, DataTypes);
const Membership = preModelmembership(sequelize, DataTypes);
const Entry = preModelentry(sequelize, DataTypes);
const NFLDivision = preModelnfldivision(sequelize, DataTypes);
const NFLPlayer = preModelnflplayer(sequelize, DataTypes);
const NFLPosition = preModelnflposition(sequelize, DataTypes);
const NFLTeam = preModelnflteam(sequelize, DataTypes);
const Offer = preModeloffer(sequelize, DataTypes);
const ProtectedMatch = preModelprotectedmatch(sequelize, DataTypes);
const RosterPosition = preModelrosterposition(sequelize, DataTypes);
const Trade = preModeltrade(sequelize, DataTypes);
const User = preModeluser(sequelize, DataTypes);

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

Offer.hasOne(Trade);
Trade.belongsTo(Offer, { foreignKey: 'bidId' });
Trade.belongsTo(Offer, { foreignKey: 'askId' });

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
  RosterPosition,
  Trade,
  User,
};

module.exports.sequelize = sequelize;
