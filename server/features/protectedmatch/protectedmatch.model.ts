import { DataTypes, ModelDefined } from 'sequelize';
import sequelize from '../../db';

import Offer from '../offer/offer.model';

export interface ProtectedMatchType {
  existingId: string,
  newId: string,
}

type ProtectedMatchCreateType = ProtectedMatchType;

const ProtectedMatch: ModelDefined<ProtectedMatchType, ProtectedMatchCreateType> = sequelize.define('ProtectedMatch', {
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
}, {
  indexes: [
    { // Make it faster to search for offers that aren't filled or cancelled
      name: 'IX_ProtMatch-Active',
      fields: ['ContestId', 'NFLPlayerId'],
    },
  ],
});

ProtectedMatch.belongsTo(Offer, { as: 'existing', foreignKey: 'existingId' });
ProtectedMatch.belongsTo(Offer, { as: 'new', foreignKey: 'newId' });

export default ProtectedMatch;
