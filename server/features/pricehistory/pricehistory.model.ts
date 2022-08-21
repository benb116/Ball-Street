import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';

import Contest from '../contest/contest.model';
import NFLPlayer from '../nflplayer/nflplayer.model';

class PriceHistory extends Model<InferAttributes<PriceHistory>, InferCreationAttributes<PriceHistory>> {
  declare lastTradePrice: number;
  declare ContestId: number;
  declare NFLPlayerId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PriceHistory.init({
  lastTradePrice: { // What was the actual price that was traded at
    type: DataTypes.INTEGER,
  },
  ContestId: {
    type: DataTypes.INTEGER,
    references: { model: Contest },
    allowNull: false,
  },
  NFLPlayerId: {
    type: DataTypes.INTEGER,
    references: { model: NFLPlayer },
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default PriceHistory;
