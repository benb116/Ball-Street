export default function out(sequelize, DataTypes) {
  return sequelize.define('NFLGame', {
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
      defaultValue: 'post',
      validate: {
        isIn: [['pre', 'mid', 'post']],
      },
    },
    startTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, { sequelize });
}