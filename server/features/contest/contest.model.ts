// A contest is the collection of entries within which users can trade players
// Each contest runs over the cource of one NFL Week
// Players start with a budget of points to spend

import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface ContestType {
  id: number,
  name: string,
  nflweek: number,
  budget: number,
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
