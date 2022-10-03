// An entry into the global transaction ledger

import Sequelize, {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '@db';

import User from '../user/user.model';
import Contest from '../contest/contest.model';
import LedgerKind from './ledgerKind.model';

class LedgerEntry extends Model<InferAttributes<LedgerEntry>, InferCreationAttributes<LedgerEntry>> {
  declare id: CreationOptional<string>;
  declare UserId: number;
  declare ContestId: number | null;
  declare value: number;
  declare LedgerKindId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LedgerEntry.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: { model: User },
    allowNull: false,
  },
  ContestId: {
    type: DataTypes.INTEGER,
    references: { model: Contest },
  },
  LedgerKindId: {
    type: DataTypes.INTEGER,
    references: { model: LedgerKind },
    allowNull: false,
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

LedgerEntry.belongsTo(User);
LedgerEntry.belongsTo(Contest);
LedgerEntry.belongsTo(LedgerKind);

export default LedgerEntry;
