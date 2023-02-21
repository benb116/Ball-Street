import Joi from 'joi';
import { QueryTypes } from 'sequelize';

import sequelize from '../../../db';
import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object<GetNFLPlayerPriceHistoryInput>({
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

/** Get price history of a player's trades */
function getNFLPlayerPriceHistory(req: GetNFLPlayerPriceHistoryInput) {
  const value = validate(req, schema);

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
