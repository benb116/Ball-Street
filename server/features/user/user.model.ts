import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface UserType {
  id: number,
  email: string,
  verified: boolean,
  name: string,
  pwHash?: string,
}

export type UserTypePWHash = Required<UserType>;

export type UserCreateType = Optional<UserTypePWHash, 'id'>;

const User: ModelDefined<UserType, UserCreateType> = sequelize.define('User', {
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
  indexes: [
    {
      name: 'IX_Users',
      fields: ['email'],
    },
  ],
});

export default User;
