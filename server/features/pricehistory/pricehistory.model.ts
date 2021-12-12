import { DataTypes, ModelDefined } from 'sequelize';
import sequelize from '../../db';

export interface PriceHistoryType {
  lastTradePrice: number,
  ContestId: number,
  NFLPlayerId: number,
}

type PriceHistoryCreateType = PriceHistoryType;

const PriceHistory: ModelDefined<PriceHistoryType, PriceHistoryCreateType> = sequelize.define('PriceHistory', {
  lastTradePrice: { // What was the actual price that was traded at
    type: DataTypes.INTEGER,
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
});

export default PriceHistory;
