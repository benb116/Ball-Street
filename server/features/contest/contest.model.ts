import { Sequelize, DataTypes } from 'sequelize';

export interface ContestType {
  id: number,
  name: string,
  nflweek: number,
  budget: number,
  createdAt: string,
  updatedAt: string,
}

export default function model(sequelize: Sequelize) {
  return sequelize.define('Contest', {
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
}
