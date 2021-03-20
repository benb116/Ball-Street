const DataTypes = require("sequelize").DataTypes;
const _contest = require("./contest");
const _entry = require("./entry");
const _nfldivision = require("./nfldivision");
const _nflplayer = require("./nflplayer");
const _nflposition = require("./nflposition");
const _nflteam = require("./nflteam");
const _offer = require("./offer");
const _protectedmatch = require("./protectedmatch");
const _roster = require("./roster");
const _RosterPosition = require("./rosterPosition");
const _trade = require("./trade");
const _user = require("./user");

function modelf() {
    this.models = {};
    return this;
}

let out = modelf();
function initModels(sequelize) {
    const Contest = _contest(sequelize, DataTypes);
    const Entry = _entry(sequelize, DataTypes);
    const NFLDivision = _nfldivision(sequelize, DataTypes);
    const NFLPlayer = _nflplayer(sequelize, DataTypes);
    const NFLPosition = _nflposition(sequelize, DataTypes);
    const NFLTeam = _nflteam(sequelize, DataTypes);
    const Offer = _offer(sequelize, DataTypes);
    const ProtectedMatch = _protectedmatch(sequelize, DataTypes);
    const Roster = _roster(sequelize, DataTypes);
    const RosterPosition = _RosterPosition(sequelize, DataTypes);
    const Trade = _trade(sequelize, DataTypes);
    const User = _user(sequelize, DataTypes);

    // Add foreign keys and references
    NFLTeam.belongsTo(NFLDivision, {foreignKey: {allowNull: false}});
    NFLDivision.hasMany(NFLTeam, {foreignKey: {allowNull: false}});
    NFLPlayer.belongsTo(NFLTeam, {foreignKey: {allowNull: false}});
    NFLTeam.hasMany(NFLPlayer, {foreignKey: {allowNull: false}});
    NFLPlayer.belongsTo(NFLPosition, {foreignKey: {allowNull: false}});
    NFLPosition.hasMany(NFLPlayer, {foreignKey: {allowNull: false}});

    RosterPosition.belongsTo(NFLPosition, {foreignKey: {allowNull: false}});
    NFLPosition.hasMany(RosterPosition, {foreignKey: {allowNull: false}});

    // User.belongsToMany(Contest, {through: Entry, foreignKey: {allowNull: false}});
    // Contest.belongsToMany(User, {through: Entry, foreignKey: {allowNull: false}});
    Entry.belongsTo(User, {foreignKey: {allowNull: false}});
    User.hasMany(Entry, {foreignKey: {allowNull: false}});
    Entry.belongsTo(Contest, {foreignKey: {allowNull: false}});
    Contest.hasMany(Entry, {foreignKey: {allowNull: false}});

    Roster.belongsTo(User, {foreignKey: {allowNull: false}});
    User.hasMany(Roster, {foreignKey: {allowNull: false}});
    Roster.belongsTo(Contest, {foreignKey: {allowNull: false}});
    Contest.hasMany(Roster, {foreignKey: {allowNull: false}});
    Roster.belongsTo(NFLPlayer, {foreignKey: {allowNull: false}});
    NFLPlayer.hasMany(Roster, {foreignKey: {allowNull: false}});
    Roster.belongsTo(RosterPosition, {foreignKey: {allowNull: false}});
    RosterPosition.hasMany(Roster, {foreignKey: {allowNull: false}});

    Offer.belongsTo(User, {foreignKey: {allowNull: false}});
    User.hasMany(Offer, {foreignKey: {allowNull: false}});
    Offer.belongsTo(Contest, {foreignKey: {allowNull: false}});
    Contest.hasMany(Offer, {foreignKey: {allowNull: false}});
    Offer.belongsTo(NFLPlayer, {foreignKey: {allowNull: false}});
    NFLPlayer.hasMany(Offer, {foreignKey: {allowNull: false}});

    ProtectedMatch.belongsTo(Offer, {as: 'existing', foreignKey: {allowNull: false}});
    Offer.hasMany(ProtectedMatch, {as: 'existing', foreignKey: {allowNull: false}});
    ProtectedMatch.belongsTo(Offer, {as: 'new', foreignKey: {allowNull: false}});
    Offer.hasMany(ProtectedMatch, {as: 'new', foreignKey: {allowNull: false}});

    Trade.belongsTo(Offer, {as: 'bid', foreignKey: {allowNull: false}});
    Offer.hasOne(Trade, {as: 'bid', foreignKey: {allowNull: false}});
    Trade.belongsTo(Offer, {as: 'ask', foreignKey: {allowNull: false}});
    Offer.hasOne(Trade, {as: 'ask', foreignKey: {allowNull: false}});

    out.models = {
        Contest,
        Entry,
        NFLDivision,
        NFLPlayer,
        NFLPosition,
        NFLTeam,
        Offer,
        ProtectedMatch,
        Roster,
        RosterPosition,
        Trade,
        User,
    };
    return out;
}
module.exports = () => out.models;
module.exports.initModels = initModels;
