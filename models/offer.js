const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Offer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
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
      defaultValue: false
    },
    filled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    UserId: {
      type: DataTypes.INTEGER,
    },
    ContestId: {
      type: DataTypes.INTEGER,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
    },
    
  }, {
    sequelize,
    indexes: [
      {
        name: 'IX_Offer-Unfilled',
        fields: ['id'],
        where: {
          filled: false
        }
      },
      {
        name: 'IX_Offer-OneActive',
        unique: true,
        fields: ['UserId', 'ContestId', 'NFLPlayerId'],
        where: {
          filled: false
        }
      }
    ]
  });
};
