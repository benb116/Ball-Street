const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Entry', {
    pointtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10000
    },
    UserId: {
      type: DataTypes.INTEGER,
    },
    ContestId: {
      type: DataTypes.INTEGER,
    },
  }, {
      sequelize,
      indexes: [
        {
          name: 'IX_Entry-User_Contest',
          unique: true,
          fields: ['UserId', 'ContestId'],
        }
      ]
  });
};
