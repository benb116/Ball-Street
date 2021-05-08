module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('League', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users' },
      allowNull: false,
    },
    ispublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true,
    },
  }, { sequelize });
};
