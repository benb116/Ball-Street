import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface NFLPositionType {
  id: number,
  name: string,
  canflex: boolean,
}

type NFLPositionCreateType = Optional<NFLPositionType, 'id'>;

const NFLPosition: ModelDefined<NFLPositionType, NFLPositionCreateType> = sequelize.define('NFLPosition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
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
});

export default NFLPosition;
