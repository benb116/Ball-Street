const sequelize = require('./db');
const DataTypes = require("sequelize").DataTypes;

const _contest = require("./features/contest/contest.model");
const _league = require("./features/league/league.model");
const _membership = require("./features/membership/membership.model");
const _entry = require("./features/entry/entry.model");
const _nfldivision = require("./features/nfldivision/nfldivision.model");
const _nflplayer = require("./features/nflplayer/nflplayer.model");
const _nflposition = require("./features/nflposition/nflposition.model");
const _nflteam = require("./features/nflteam/nflteam.model");
const _offer = require("./features/offer/offer.model");
const _protectedmatch = require("./features/protectedmatch/protectedmatch.model");
const _rosterposition = require("./features/rosterposition/rosterposition.model");
const _trade = require("./features/trade/trade.model");
const _user = require("./features/user/user.model");

const Contest = _contest(sequelize, DataTypes);
const League = _league(sequelize, DataTypes);
const Membership = _membership(sequelize, DataTypes);
const Entry = _entry(sequelize, DataTypes);
const NFLDivision = _nfldivision(sequelize, DataTypes);
const NFLPlayer = _nflplayer(sequelize, DataTypes);
const NFLPosition = _nflposition(sequelize, DataTypes);
const NFLTeam = _nflteam(sequelize, DataTypes);
const Offer = _offer(sequelize, DataTypes);
const ProtectedMatch = _protectedmatch(sequelize, DataTypes);
const RosterPosition = _rosterposition(sequelize, DataTypes);
const Trade = _trade(sequelize, DataTypes);
const User = _user(sequelize, DataTypes);

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
    RosterPosition,
    Trade,
    User,
};

module.exports.sequelize = sequelize;