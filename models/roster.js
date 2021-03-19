const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Roster', {
    UserId: {
      type: DataTypes.INTEGER,
    },
    ContestId: {
      type: DataTypes.INTEGER,
    },
    RosterPositionId: {
      type: DataTypes.INTEGER,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      validate: {
        // Make sure that we don't allow a WR in a RB3 spot
        // And make sure that we don't allow a QB in a FLEX
        async isCorrectPosition(value, next) {
          const res1 = await sequelize.models.NFLPlayer.findById(value);
          const res2 = await sequelize.models.RosterPosition.findById(this.RosterPositionId);

          const playerType = res1.NFLPositionId;
          const rosterType = res2.NFLPositionId;

          if (playerType === rosterType) {
            next();
          } else if (rosterType === 0) {
            const res3 = await sequelize.models.NFLPosition.findById(playerType);
            if (res3.canflex) {
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
