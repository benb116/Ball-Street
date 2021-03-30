const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('League', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
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
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 10000,
    }
  }, {sequelize});
};
