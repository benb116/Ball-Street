export default function model(sequelize, DataTypes) {
  return sequelize.define('ProtectedMatch', {
    existingId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      primaryKey: true,
    },
    newId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      primaryKey: true,
    },
  }, { sequelize });
};
