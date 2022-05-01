import { DataTypes, ModelDefined } from 'sequelize';
import sequelize from '../../db';

export interface EntryActionKindType {
  id: number,
  name: string,
}
type EntryActionKindCreateType = EntryActionKindType;

const EntryActionKind:
ModelDefined<EntryActionKindType, EntryActionKindCreateType> = sequelize.define('EntryActionKind', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default EntryActionKind;
