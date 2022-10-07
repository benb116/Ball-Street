import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';

/**
 * A contest is the collection of entries within which users can trade players.
 * Each contest runs over the cource of one NFL Week.
 * Players start with a budget of points to spend.
 */
class Contest extends Model<InferAttributes<Contest>, InferCreationAttributes<Contest>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare nflweek: number;
  declare budget: number;
  declare buyin: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Contest.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
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
  buyin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default Contest;
