import { Sequelize, DataTypes } from 'sequelize';

import { FlexNFLPositionId } from '../../config';

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
        isNotFlex(value: number) { // Make sure we never list a player as a true flex
          if (value === FlexNFLPositionId) { throw new Error('Cannot have a NFLPlayer as a flex'); }
        },
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
