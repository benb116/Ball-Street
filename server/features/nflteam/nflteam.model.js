module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('NFLTeam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    location: { // Philadelphia
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: { // Eagles
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fullname: { // Philadelphia Eagles
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.location} ${this.name}`;
      },
    },
    abr: { // PHL
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    gamePhase: {
      type: DataTypes.STRING(255),
      allowNull: false,
      default: 'post',
      validate: {
        isIn: [['pre', 'mid', 'post']],
      },
    },
    NFLDivisionId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLDivisions' },
      allowNull: false,
    },
  }, { sequelize });
};
