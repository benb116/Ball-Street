import Joi from 'joi';
import { Op } from 'sequelize';

import { Roster } from '../../../../types/rosterinfo';
import Entry from '../../entry/entry.model';
import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object<GetNFLPlayerNumAddsInput>({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

interface GetNFLPlayerNumAddsInput extends ServiceInput {
  params: {
    contestID: number,
    nflplayerID: number,
  },
  body: Record<string, never>
}

/** How many entries have added this player */
// Search across all position columns
function getNFLPlayerNumAdds(req: GetNFLPlayerNumAddsInput) {
  const value = validate(req, schema);

  return Entry.count({
    where: {
      ContestId: value.params.contestID,
      [Op.or]: gen(value.params.nflplayerID),
    },
  });

  function gen(_player: number) {
    const rpos = Object.keys(Roster);
    return rpos.map((r) => {
      const out: Record<string, number> = {};
      out[r] = _player;
      return out;
    });
  }
}

export default getNFLPlayerNumAdds;
