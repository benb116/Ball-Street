const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NFLTeam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    location: { // Philadelphia
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: { // Eagles
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullname: { // Philadelphia Eagles
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.location} ${this.name}`;
      } 
    },
    abr: { // PHL
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    NFLDivisionId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLDivisions' },
      allowNull: false,
    }
  }, {sequelize});
};
