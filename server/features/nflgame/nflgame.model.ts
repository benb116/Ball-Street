// Info about an NFL Game
// Home team, away team, week #, and start timestamp
// Also includes a phase to determine whether players can be traded
/* eslint-disable @typescript-eslint/lines-between-class-members */
import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';
import { gamePhases, GamePhaseType } from '../../config';

import NFLTeam from '../nflteam/nflteam.model';

class NFLGame extends Model<InferAttributes<NFLGame>, InferCreationAttributes<NFLGame>> {
  declare week: number;
  declare HomeId: number;
  declare AwayId: number;
  declare phase: GamePhaseType;
  declare startTime: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NFLGame.init({
  week: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  HomeId: {
    type: DataTypes.INTEGER,
    references: { model: NFLTeam },
    allowNull: false,
    primaryKey: true,
  },
  AwayId: {
    type: DataTypes.INTEGER,
    references: { model: NFLTeam },
    allowNull: false,
    primaryKey: true,
  },
  phase: {
    type: DataTypes.STRING(255),
    defaultValue: 'post',
    validate: {
      isIn: [gamePhases],
    },
  },
  startTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

NFLGame.belongsTo(NFLTeam, { as: 'home', foreignKey: 'HomeId' });
NFLGame.belongsTo(NFLTeam, { as: 'away', foreignKey: 'AwayId' });

export default NFLGame;
