import Sequelize, {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, NonAttribute, Association,
} from 'sequelize';
import sequelize from '../../db';

import EntryActionKind from './entryactionkind.model';

class EntryAction extends Model<InferAttributes<EntryAction>, InferCreationAttributes<EntryAction>> {
  declare id: CreationOptional<string>;
  declare EntryActionKindId: number;
  declare UserId: number;
  declare ContestId: number;
  declare NFLPlayerId: number;
  declare price: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare EntryActionKind?: NonAttribute<EntryActionKind>;
  declare static associations: {
    EntryActionKind: Association<EntryAction, EntryActionKind>;
  };
}

EntryAction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  EntryActionKindId: { // Kind of action
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: EntryActionKind },
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
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize });

EntryAction.belongsTo(EntryActionKind);

export default EntryAction;
