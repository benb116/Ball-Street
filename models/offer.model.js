const Sequelize = require('sequelize');
const config = require('../config');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Offer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    isbid: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    protected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: config.DefaultProtected
    },
    filled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    cancelled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPlayers' },
      allowNull: false,
    },
    
  }, {
    sequelize,
    indexes: [
      {
        name: 'IX_Offer-Active',
        fields: ['id'],
        where: {
          filled: false,
          cancelled: false
        }
      },
      {
        name: 'IX_Offer-OneActive',
        unique: true,
        fields: ['UserId', 'ContestId', 'NFLPlayerId'],
        where: {
          filled: false,
          cancelled: false
        }
      }
    ]
  });
};
