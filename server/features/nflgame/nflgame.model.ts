// Info about an NFL Game
// Home team, away team, week #, and start timestamp
// Also includes a phase to determine whether players can be traded
import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, NonAttribute, Association,
} from 'sequelize';

import { gamePhases, GamePhaseType } from '../../../types/rosterinfo';
import sequelize from '../../db';
import NFLTeam from '../nflteam/nflteam.model';

class NFLGame extends Model<InferAttributes<NFLGame>, InferCreationAttributes<NFLGame>> {
  declare week: number;
  declare HomeId: number;
  declare AwayId: number;
  declare phase: GamePhaseType;
  declare startTime: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare home?: NonAttribute<NFLTeam>;
  declare away?: NonAttribute<NFLTeam>;
  declare static associations: {
    home: Association<NFLGame, NFLTeam>;
    away: Association<NFLGame, NFLTeam>;
  };
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
