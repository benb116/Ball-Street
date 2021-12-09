import { DataTypes } from 'sequelize';

export default function model(sequelize) {
  return sequelize.define('NFLPosition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canflex: { // E.g. RB can flex but DEF can't
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, { sequelize });
}
