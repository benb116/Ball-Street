import { DataTypes, Sequelize } from 'sequelize';

export default function model(sequelize: Sequelize) {
  return sequelize.define('PriceHistory', {
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
}
