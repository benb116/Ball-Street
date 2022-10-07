import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '@db';

import Offer from '../offer/offer.model';

export interface TradeType {
  price: number,
  bidId: string,
  askId: string,
}
export type TradeCreateType = TradeType;
class Trade extends Model<InferAttributes<Trade>, InferCreationAttributes<Trade>> {
  declare price: number;
  declare bidId: string;
  declare askId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Trade.init({
  price: { // What was the actual price that was traded at
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bidId: {
    type: DataTypes.UUID,
    references: { model: Offer },
    allowNull: false,
    primaryKey: true,
  },
  askId: {
    type: DataTypes.UUID,
    references: { model: Offer },
    allowNull: false,
    primaryKey: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

Trade.belongsTo(Offer, { as: 'bid', foreignKey: 'bidId' });
Trade.belongsTo(Offer, { as: 'ask', foreignKey: 'askId' });

export default Trade;
