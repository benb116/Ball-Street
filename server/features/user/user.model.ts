import { DataTypes, Sequelize } from 'sequelize';

export interface UserType {
  id: number,
  email: string,
  verified: boolean,
  name: string,
  createdAt: string,
  updatedAt: string,
}
export interface UserTypePWHash extends UserType {
  pwHash: string,
}

export default function out(sequelize: Sequelize) {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pwHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    defaultScope: {
      attributes: { exclude: ['pwHash'] },
    },
    scopes: {
      withPassword: {
        attributes: { exclude: [] },
      },
    },
  });
}
