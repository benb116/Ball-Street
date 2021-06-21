const { Sequelize, QueryTypes } = require('sequelize');

module.exports = function model(sequelize, DataTypes) {
  const m = sequelize.define('PriceHistory', {
    lastTradePrice: { // What was the actual price that was traded at
      type: DataTypes.INTEGER,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      allowNull: false,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPlayers' },
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      default: Sequelize.NOW,
    },
  }, { sequelize });

  m.getWeekPrices = async function getWeekPrices(contestID, nflplayerID) {
    return sequelize.query(`
      SELECT time_bucket('1 minute', time) as "bucket", ContestId, NFLPlayerId, avg(lastTradePrice)
      FROM PriceHistories
      WHERE time > now() - (4 * INTERVAL '1 day')
        AND ContestId = $contestID
        AND NFLPlayerId = $nflplayerID
      GROUP BY bucket, ContestId, NFLPlayerId
      ORDER BY bucket DESC;
    `, {
      type: QueryTypes.SELECT,
      bind: {
        contestID,
        nflplayerID,
      },
    });
  };

  return m;
};
