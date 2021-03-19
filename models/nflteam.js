const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NFLTeam', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullname: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.location} ${this.name}`;
      } 
    },
    abr: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    NFLDivisionId: {
      type: DataTypes.INTEGER
    }
  }, {sequelize});
};
