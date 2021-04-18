module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('Contest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nflweek: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    LeagueId: {
      type: DataTypes.INTEGER,
      references: { model: 'Leagues' },
      allowNull: false,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, { sequelize });
};
