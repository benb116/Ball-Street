import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';

class EntryActionKind extends Model<InferAttributes<EntryActionKind>, InferCreationAttributes<EntryActionKind>> {
  declare id: number;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EntryActionKind.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default EntryActionKind;
