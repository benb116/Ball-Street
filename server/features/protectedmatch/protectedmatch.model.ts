import { DataTypes, Sequelize } from 'sequelize';

export interface ProtectedMatchType {
  existingId: string,
  newId: string,
  createdAt: string,
  updatedAt: string,
}

export default function model(sequelize: Sequelize) {
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
  });
}
