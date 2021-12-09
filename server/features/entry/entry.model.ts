import { Sequelize, DataTypes } from 'sequelize';

import { Roster } from '../../config';

// The model has common columns (UserId, ContestId, pointtotal)
// This script also generates columns based on the set roster in config
// So it will add a "QB1" column, a "FLEX2" column, etc. All with allowNull = true
// Those columns store the NFLPlayerId of the player in that roster position

interface RPosType {
  type: DataTypes.IntegerDataTypeConstructor,
  references: {
    model: string,
  },
  allowNull: boolean,
}
// Add position columns as defined by config
const rpos = Object.keys(Roster);
const rosterobj = rpos.reduce((acc, p) => {
  acc[p] = {
    type: DataTypes.INTEGER,
    references: { model: 'NFLPlayers' },
    allowNull: true,
  };
  return acc;
}, {} as Record<string, RPosType>);

function model() {
  const modelobj = {
    pointtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users' },
      primaryKey: true,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      primaryKey: true,
    },
  };

  return { ...modelobj, ...rosterobj };
}

export default function out(sequelize: Sequelize) {
  return sequelize.define('Entry', model());
}
