const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Roster', {
    UserId: {
      type: DataTypes.INTEGER,
    },
    ContestId: {
      type: DataTypes.INTEGER,
    },
    TeamPositionId: {
      type: DataTypes.INTEGER,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      validate: {
        isCorrectPosition(value, next) {
          Promise.all([
            sequelize.models.NFLPlayer.findById(value),
            sequelize.models.TeamPosition.findById(this.TeamPositionId)
          ]).then(results => {
            if (results[0] !== results[1]) {
              throw new Error('Trying to put a player in the wrong roster position!');
            } else {
              next();
            }
          });
        }
      }
    },
  }, {
    sequelize,
    indexes: [
      {
        name: 'IX_Roster-User_Contest_TeamPosition',
        unique: true,
        fields: ['UserId', 'ContestId', 'TeamPositionId'],
      },
      {
        name: 'IX_Roster-User_Contest_NFLPlayer',
        unique: true,
        fields: ['UserId', 'ContestId', 'NFLPlayerId'],
      }
    ]
  });
};
