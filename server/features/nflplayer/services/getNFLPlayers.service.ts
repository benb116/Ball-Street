import { dv } from '../../util/util';

import { NFLPlayer } from '../../../models';

function getNFLPlayers() {
  return NFLPlayer.findAll({ where: { active: true } }).then(dv);
}

export default getNFLPlayers;
