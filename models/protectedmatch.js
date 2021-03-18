const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ProtectedMatch', {
    existingId: {
      type: DataTypes.UUID,
    },
    newId: {
      type: DataTypes.UUID,
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
