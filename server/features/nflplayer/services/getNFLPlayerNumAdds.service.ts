import { Op } from 'sequelize';
import Joi from 'joi';

import { validate } from '../../util/util';
import { Roster } from '../../../config';

import validators from '../../util/util.schema';

import { ServiceInput } from '../../util/util.service';
import Entry from '../../entry/entry.model';

const schema = Joi.object({
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

function getNFLPlayerNumAdds(req: GetNFLPlayerNumAddsInput) {
  const value: GetNFLPlayerNumAddsInput = validate(req, schema);

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
