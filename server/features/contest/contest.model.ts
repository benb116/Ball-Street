export default function model(sequelize, DataTypes) {
  return sequelize.define('Contest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nflweek: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, { sequelize });
}