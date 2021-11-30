const { QueryTypes } = require('sequelize');
const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerPriceHistory(req) {
  const value = u.validate(req, schema);

  return sequelize.query(`
      SELECT time_bucket('1 minute', "createdAt") as "bucket",
        "ContestId",
        "NFLPlayerId",
        last("lastTradePrice", "createdAt")
      FROM "PriceHistories"
      WHERE "createdAt" > now() - (4 * INTERVAL '1 day')
        AND "ContestId" = $contestID
        AND "NFLPlayerId" = $nflplayerID
      GROUP BY bucket, "ContestId", "NFLPlayerId"
      ORDER BY bucket DESC;
    `, {
    type: QueryTypes.SELECT,
    bind: {
      contestID: value.params.contestID,
      nflplayerID: value.params.nflplayerID,
    },
  });
}

module.exports = getNFLPlayerPriceHistory;
