import { DataTypes, ModelDefined } from 'sequelize';
import sequelize from '../../db';
import Offer from '../offer/offer.model';

export interface TradeType {
  price: number,
  bidId: string,
  askId: string,
}
type TradeCreateType = TradeType;

const Trade: ModelDefined<TradeType, TradeCreateType> = sequelize.define('Trade', {
  price: { // What was the actual price that was traded at
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bidId: {
    type: DataTypes.UUID,
    references: { model: 'Offers' },
    allowNull: false,
    primaryKey: true,
  },
  askId: {
    type: DataTypes.UUID,
    references: { model: 'Offers' },
    allowNull: false,
    primaryKey: true,
  },
});

Trade.belongsTo(Offer, { as: 'bid', foreignKey: 'bidId' });
Trade.belongsTo(Offer, { as: 'ask', foreignKey: 'askId' });

export default Trade;
