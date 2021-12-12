import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface NFLTeamType {
  id: number,
  location: string,
  name: string,
  fullname: string,
  abr: string,
}

type NFLTeamCreateType = Optional<NFLTeamType, 'id' | 'fullname'>;

const NFLTeam: ModelDefined<NFLTeamType, NFLTeamCreateType> = sequelize.define('NFLTeam', {
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
      // @ts-expect-error - Location and name are in model
      return `${this.location} ${this.name}`;
    },
  },
  abr: { // PHL
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
});

export default NFLTeam;
