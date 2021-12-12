import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface ContestType {
  id: number,
  name: string,
  nflweek: number,
  budget: number,
  // createdAt: string,
  // updatedAt: string,
}

export type ContestCreateType = Optional<ContestType, 'id'>;

const Contest: ModelDefined<ContestType, ContestCreateType> = sequelize.define('Contest', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nflweek: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  budget: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Contest;
