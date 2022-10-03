// Static table of types for ledger entries

import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '@db';

class LedgerKind extends Model<InferAttributes<LedgerKind>, InferCreationAttributes<LedgerKind>> {
  declare id: number;
  declare name: string;
  declare isCredit: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LedgerKind.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isCredit: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

export default LedgerKind;
