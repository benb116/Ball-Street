const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Roster', {
    UserId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users' },
      allowNull: false,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      allowNull: false,
    },
    RosterPositionId: {
      type: DataTypes.INTEGER,
      references: { model: 'RosterPositions' },
      allowNull: false,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPlayers' },
      allowNull: false,
      validate: {
        // Make sure that we don't allow a WR in a RB3 spot
        // And make sure that we don't allow a QB in a FLEX
        async isCorrectPosition(value, next) {
          const playerType = await sequelize.models.NFLPlayer.findByPk(value).then(d => d.dataValues.NFLPositionId);
          const rosterType = await sequelize.models.RosterPosition.findByPk(this.RosterPositionId).then(d => d.dataValues.NFLPositionId);

          if (playerType === rosterType) {
            next();
          } else if (rosterType === 99) {
            const canflex = await sequelize.models.NFLPosition.findByPk(playerType).then(d => d.dataValues.canflex);
            if (canflex) {
              next();
            } else {
              throw new Error('Trying to put a non-flex player in a flex position!');
            }
          } else {
            throw new Error('Trying to put a player in an incorrect position!');    
          }
        }
      }
    },
  }, {
    sequelize,
    indexes: [
      {
        name: 'IX_Roster-User_Contest_RosterPosition',
        unique: true,
        fields: ['UserId', 'ContestId', 'RosterPositionId'],
      },
      {
        name: 'IX_Roster-User_Contest_NFLPlayer',
        unique: true,
        fields: ['UserId', 'ContestId', 'NFLPlayerId'],
      }
    ]
  });
};
