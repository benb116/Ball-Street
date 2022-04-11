// An entry into the global transaction ledger

import Sequelize, { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

import User from '../user/user.model';
import Contest from '../contest/contest.model';
import LedgerKind from './ledgerKind.model';

export interface LedgerEntryType {
  id: string,
  UserId: number,
  ContestId: number | null,
  value: number,
  LedgerKindId: number,
}
export type LedgerEntryCreateType = Optional<LedgerEntryType, 'id'>;

const LedgerEntry: ModelDefined<LedgerEntryType, LedgerEntryCreateType> = sequelize.define('LedgerEntry', {
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
});

LedgerEntry.belongsTo(User);
LedgerEntry.belongsTo(Contest);
LedgerEntry.belongsTo(LedgerKind);

export default LedgerEntry;
