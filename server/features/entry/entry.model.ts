// A users entry into a contest
// Stores number of points and which players are on the roster
import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

import { Roster } from '../../config';

import User, { UserType } from '../user/user.model';
import Contest from '../contest/contest.model';

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

export interface EntryType {
  pointtotal: number,
  UserId: number,
  ContestId: number,
  [key: string]: number | null | UserType,
}

export type EntryCreateType = Optional<EntryType, 'id'>;

const Entry: ModelDefined<EntryType, EntryCreateType> = sequelize.define('Entry', model());

function model() {
  const modelobj = {
    pointtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: { model: User },
      primaryKey: true,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: Contest },
      primaryKey: true,
    },
  };

  return { ...modelobj, ...rosterobj };
}

Entry.belongsTo(User);
Entry.belongsTo(Contest);

export default Entry;
