import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare verified: boolean;
  declare name: string;
  declare pwHash: string;
  declare cash: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init({
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
  cash: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  // TBD scopes?
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
