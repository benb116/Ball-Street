const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ProtectedMatch', {
    existingId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
    },
    newId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
    },
  }, {
      sequelize,
      indexes: [
        {
          name: 'IX_ProtectedMatch-Offer_Offer',
          unique: true,
          fields: ['existingId', 'newId'],
        }
      ]
  });
};
