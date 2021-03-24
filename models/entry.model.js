const { Sequelize, DataTypes } = require('sequelize');
const u = require('../util');
const config = require('../config');

function model(sequelize) {
    let modelobj = {
        pointtotal: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10000
        },
        UserId: {
            type: DataTypes.INTEGER,
            references: { model: 'Users' },
            primaryKey: true,
        },
        ContestId: {
            type: DataTypes.INTEGER,
            references: { model: 'Contests' },
            primaryKey: true,
        },
    };

    // Add position columns as defined by config
    const rpos = Object.keys(config.Roster);
    rpos.forEach((p, i) => {
        modelobj[p] = {
            type: DataTypes.INTEGER,
            references: { model: 'NFLPlayers' },
            allowNull: true,
        };
    });

    return modelobj;
}


module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Entry', model(sequelize), { sequelize });
};
