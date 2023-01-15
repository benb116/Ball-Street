import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';

import sequelize from '../../db';
import Offer from '../offer/offer.model';

class ProtectedMatch extends Model<InferAttributes<ProtectedMatch>, InferCreationAttributes<ProtectedMatch>> {
  declare existingId: string;
  declare newId: string;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
ProtectedMatch.init({
  existingId: {
    type: DataTypes.UUID,
    references: { model: Offer },
    primaryKey: true,
  },
  newId: {
    type: DataTypes.UUID,
    references: { model: Offer },
    primaryKey: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  indexes: [
    { // Make it faster to search for offers that aren't filled or cancelled
      name: 'IX_Match-Active',
      fields: ['active', 'existingId'],
      where: {
        active: true,
      },
    },
  ],
});

ProtectedMatch.belongsTo(Offer, { as: 'existing', foreignKey: 'existingId' });
ProtectedMatch.belongsTo(Offer, { as: 'new', foreignKey: 'newId' });

export default ProtectedMatch;
