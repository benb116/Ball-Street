import { Op } from 'sequelize'
import Joi from 'joi'

import { dv, validate } from '../../util/util'
import config from '../../../config'

import validators from '../../util/util.schema'

import { Entry } from '../../../models'

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerNumAdds(req) {
  const value = validate(req, schema);

  return Entry.count({
    where: {
      ContestId: value.params.contestID,
      [Op.or]: gen(value.params.nflplayerID),
    },
  }).then(dv);

  function gen(_player) {
    const rpos = Object.keys(config.Roster);
    return rpos.map((r) => {
      const out = {};
      out[r] = _player;
      return out;
    });
  }
}

export default getNFLPlayerNumAdds;
