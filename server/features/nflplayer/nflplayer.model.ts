import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

import { NFLPosTypes } from '../../config';
import NFLTeam from '../nflteam/nflteam.model';
import NFLPosition from '../nflposition/nflposition.model';

export interface NFLPlayerType {
  id: number,
  name: string,
  jersey?: number | null,
  preprice: number | null,
  postprice: number | null,
  NFLPositionId: number,
  NFLTeamId: number,
  active: boolean,
  injuryStatus: string | null,
}

const NFLPosIDs = Object.keys(NFLPosTypes);

export type NFLPlayerCreateType = Optional<NFLPlayerType, 'id' | 'active' | 'injuryStatus'>;

const NFLPlayer: ModelDefined<NFLPlayerType, NFLPlayerCreateType> = sequelize.define('NFLPlayer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jersey: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  preprice: { // How much can someone pay to add before games start
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postprice: { // How many points is the player worth after a game
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  NFLPositionId: { // RB, not RB2
    type: DataTypes.INTEGER,
    references: { model: NFLPosition },
    allowNull: false,
    validate: {
      isIn: [NFLPosIDs],
    },
  },
  NFLTeamId: {
    type: DataTypes.INTEGER,
    references: { model: NFLTeam },
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  injuryStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    validate: {
      isIn: [[null, 'P', 'Q', 'D', 'O']],
    },
  },
});

NFLPlayer.belongsTo(NFLTeam);
NFLPlayer.belongsTo(NFLPosition);

export default NFLPlayer;
