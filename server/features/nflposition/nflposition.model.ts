// Model for an NFL Position (e.g. WR, DEF, not WR1, DEF1)

import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';

import { NFLPosIDs, NFLPosIDType } from '../../../types/rosterinfo';
import sequelize from '../../db';

class NFLPosition extends Model<InferAttributes<NFLPosition>, InferCreationAttributes<NFLPosition>> {
  declare id: NFLPosIDType;
  declare name: string;
  declare canflex: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NFLPosition.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    validate: {
      isIn: [NFLPosIDs],
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  canflex: { // E.g. RB can flex but DEF can't
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default NFLPosition;
