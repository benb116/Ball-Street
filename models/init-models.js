var DataTypes = require("sequelize").DataTypes;
var _contest = require("./contest");
var _entry = require("./entry");
var _nfldivision = require("./nfldivision");
var _nflplayer = require("./nflplayer");
var _nflposition = require("./nflposition");
var _nflteam = require("./nflteam");
var _offer = require("./offer");
var _protectedmatch = require("./protectedmatch");
var _roster = require("./roster");
var _teamposition = require("./teamposition");
var _trade = require("./trade");
var _user = require("./user");

function initModels(sequelize) {
    var Contest = _contest(sequelize, DataTypes);
    var Entry = _entry(sequelize, DataTypes);
    var NFLDivision = _nfldivision(sequelize, DataTypes);
    var NFLPlayer = _nflplayer(sequelize, DataTypes);
    var NFLPosition = _nflposition(sequelize, DataTypes);
    var NFLTeam = _nflteam(sequelize, DataTypes);
    var Offer = _offer(sequelize, DataTypes);
    var ProtectedMatch = _protectedmatch(sequelize, DataTypes);
    var Roster = _roster(sequelize, DataTypes);
    var TeamPosition = _teamposition(sequelize, DataTypes);
    var Trade = _trade(sequelize, DataTypes);
    var User = _user(sequelize, DataTypes);

    // Add foreign keys and references
        NFLTeam.belongsTo(NFLDivision, {foreignKey: {allowNull: false}});
        NFLDivision.hasMany(NFLTeam, {foreignKey: {allowNull: false}});
        NFLPlayer.belongsTo(NFLTeam, {foreignKey: {allowNull: false}});
        NFLTeam.hasMany(NFLPlayer, {foreignKey: {allowNull: false}});
        NFLPlayer.belongsTo(NFLPosition, {foreignKey: {allowNull: false}});
        NFLPosition.hasMany(NFLPlayer, {foreignKey: {allowNull: false}});

        TeamPosition.belongsTo(NFLPosition, {foreignKey: {allowNull: false}});
        NFLPosition.hasMany(TeamPosition, {foreignKey: {allowNull: false}});

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
        Roster.belongsTo(TeamPosition, {foreignKey: {allowNull: false}});
        TeamPosition.hasMany(Roster, {foreignKey: {allowNull: false}});

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

    

    return {
        Contest,
        Entry,
        NFLDivision,
        NFLPlayer,
        NFLPosition,
        NFLTeam,
        Offer,
        ProtectedMatch,
        Roster,
        TeamPosition,
        Trade,
        User,
    };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
