import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

import NFLTeam from '../nflteam/nflteam.model';

export interface NFLGameType {
  week: number,
  HomeId: number,
  AwayId: number,
  phase: string,
  startTime: number,
}

export type NFLGameCreateType = Optional<NFLGameType, 'phase'>;

const NFLGame: ModelDefined<NFLGameType, NFLGameCreateType> = sequelize.define('NFLGame', {
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
      isIn: [['pre', 'mid', 'post']],
    },
  },
  startTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

NFLGame.belongsTo(NFLTeam, { as: 'home', foreignKey: 'HomeId' });
NFLGame.belongsTo(NFLTeam, { as: 'away', foreignKey: 'AwayId' });

export default NFLGame;
