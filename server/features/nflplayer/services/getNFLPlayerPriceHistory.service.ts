import { QueryTypes } from 'sequelize';
import Joi from 'joi';

import { validate } from '../../util/util';

import sequelize from '../../../db';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

interface GetNFLPlayerPriceHistoryInput extends ServiceInput {
  params: {
    contestID: number,
    nflplayerID: number,
  },
  body: Record<string, never>
}

function getNFLPlayerPriceHistory(req: GetNFLPlayerPriceHistoryInput) {
  const value: GetNFLPlayerPriceHistoryInput = validate(req, schema);

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

export default getNFLPlayerPriceHistory;
