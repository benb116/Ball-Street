module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('RosterPosition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { // RB2
      type: DataTypes.STRING,
      allowNull: false,
    },
    NFLPositionId: { // RB2 is an RB position
      type: DataTypes.INTEGER,
      references: { model: 'NFLPositions' },
      allowNull: false,
    },
  }, { sequelize });
};
