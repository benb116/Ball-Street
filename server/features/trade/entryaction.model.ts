import Sequelize, { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';
import EntryActionKind from './entryactionkind.model';

export interface EntryActionType {
  id: string,
  EntryActionKindId: number,
  UserId: number,
  ContestId: number,
  NFLPlayerId: number,
  price: number,
}

export type EntryActionCreateType = Optional<EntryActionType, 'id'>;

const EntryAction: ModelDefined<EntryActionType, EntryActionCreateType> = sequelize.define('EntryAction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  EntryActionKindId: { // Kind of action
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'EntryActionKinds' },
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ContestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  NFLPlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

EntryAction.belongsTo(EntryActionKind);

export default EntryAction;
