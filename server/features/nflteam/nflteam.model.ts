// Model for an NFL Team
import {
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model,
} from 'sequelize';

import sequelize from '../../db';

class NFLTeam extends Model<InferAttributes<NFLTeam>, InferCreationAttributes<NFLTeam>> {
  declare id: number;
  declare location: string;
  declare name: string;
  // get fullName(): NonAttribute<string> { // Philadelphia Eagles
  //   return `${this.location} ${this.name}`;
  // }
  declare fullname: string;
  declare abr: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NFLTeam.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  location: { // Philadelphia
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  name: { // Eagles
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fullname: { // Philadelphia Eagles
    type: DataTypes.VIRTUAL,
    get(): string {
      return `${this.location} ${this.name}`;
    },
  },
  abr: { // PHL
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default NFLTeam;
