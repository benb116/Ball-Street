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
      references: { model: 'Users' },
      allowNull: false,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      allowNull: false,
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
