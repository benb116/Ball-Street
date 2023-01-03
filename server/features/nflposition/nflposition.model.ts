// Model for an NFL Position (e.g. WR, DEF, not WR1, DEF1)

import {
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model,
} from 'sequelize';

import { NFLPosIDType, NFLPosIDs } from '../../config';
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
