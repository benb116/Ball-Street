module.exports = function out(sequelize, DataTypes) {
  return sequelize.define('NFLGame', {
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    HomeId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLTeams' },
      allowNull: false,
      primaryKey: true,
    },
    AwayId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLTeams' },
      allowNull: false,
      primaryKey: true,
    },
    phase: {
      type: DataTypes.STRING(255),
      default: 'post',
      validate: {
        isIn: [['pre', 'mid', 'post']],
      },
    },
  }, { sequelize });
};
