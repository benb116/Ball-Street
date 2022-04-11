import { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';

export interface LedgerKindType {
  id: number,
  name: string,
  isCredit: boolean,
}
type LedgerKindCreateType = Optional<LedgerKindType, 'id'>;

const LedgerKind: ModelDefined<LedgerKindType, LedgerKindCreateType> = sequelize.define('LedgerKind', {
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
});

export default LedgerKind;
