// A users entry into a contest
// Stores number of points and which players are on the roster
import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, NonAttribute,
} from 'sequelize';
import sequelize from '@db';

import { RosterPositions, RPosType } from '@server/config';

import User from '../user/user.model';
import Contest from '../contest/contest.model';
import NFLPlayer from '../nflplayer/nflplayer.model';

// The model has common columns (UserId, ContestId, pointtotal)
// This script also generates columns based on the set roster in config
// So it will add a "QB1" column, a "FLEX2" column, etc. All with allowNull = true
// Those columns store the NFLPlayerId of the player in that roster position

interface RosterModelType {
  type: DataTypes.IntegerDataTypeConstructor,
  references: {
    model: typeof NFLPlayer,
  },
  allowNull: boolean,
}

// Add position columns as defined by config
const rosterobj = RosterPositions.reduce((acc, p) => {
  acc[p] = {
    type: DataTypes.INTEGER,
    references: { model: NFLPlayer },
    allowNull: true,
  };
  return acc;
}, {} as Record<RPosType, RosterModelType>);

class Entry extends Model<InferAttributes<Entry>, InferCreationAttributes<Entry>> {
  declare pointtotal: number;
  declare UserId: number;
  declare ContestId: number;

  declare QB1: number | null;
  declare RB1: number | null;
  declare RB2: number | null;
  declare WR1: number | null;
  declare WR2: number | null;
  declare TE1: number | null;
  declare FLEX1: number | null;
  declare FLEX2: number | null;
  declare K1: number | null;
  declare DEF1: number | null;

  declare User?: NonAttribute<User>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Entry.init(model(), { sequelize });

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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  };

  return { ...modelobj, ...rosterobj };
}

Entry.belongsTo(User);
Entry.belongsTo(Contest);

export default Entry;
