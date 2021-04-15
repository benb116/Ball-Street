module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('Membership', {
    UserId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users' },
      allowNull: false,
      primaryKey: true,
    },
    LeagueId: {
      type: DataTypes.INTEGER,
      references: { model: 'Leagues' },
      allowNull: false,
      primaryKey: true,
    },
  }, { sequelize });
};
