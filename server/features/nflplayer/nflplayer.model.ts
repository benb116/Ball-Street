import { Sequelize, DataTypes } from 'sequelize';

import { NFLPosTypes } from '../../config';

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
  createdAt: string,
  updatedAt: string,
}

const NFLPosIDs = Object.keys(NFLPosTypes);

export default function out(sequelize: Sequelize) {
  return sequelize.define('NFLPlayer', {
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
      references: { model: 'NFLPositions' },
      allowNull: false,
      validate: {
        isIn: [NFLPosIDs],
      },
    },
    NFLTeamId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLTeams' },
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
}
