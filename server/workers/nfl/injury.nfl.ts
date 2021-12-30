// Get all injured players
// Find changes and send out updates

import axios from 'axios';

import logger from '../../utilities/logger';

import state from './state.nfl';

import injuryUpdate, { InjuryUpdateType } from '../live/channels/injuryUpdate.channel';

import NFLPlayer, { NFLPlayerCreateType } from '../../features/nflplayer/nflplayer.model';

let injuryInited = false;

export default async function PullLatestInjuries() {
  return axios.get('https://football.fantasysports.yahoo.com/f1/injuries')
    .then(Format)
    .then((arr) => arr.filter((e) => {
      // Update injobj and return players that changed
      if (!e || !e.id) return false;
      const oldstatus = state.injObj[e.id];
      state.injObj[e.id] = e.injuryStatus;
      return oldstatus !== e.injuryStatus;
    }))
    .then((objs) => {
      // Pushout updates for each
      if (objs.length) {
        const outObj = objs.reduce((acc, cur) => {
          if (cur && cur.id) acc[cur.id] = cur.injuryStatus;
          return acc;
        }, {} as InjuryUpdateType);

        injuryUpdate.pub(outObj);
      }
      return objs;
    })
    .then(async (objs) => {
      if (!injuryInited) {
        injuryInited = true;
        await NFLPlayer.bulkCreate(objs, { updateOnDuplicate: ['injuryStatus'] });
        return NFLPlayer.destroy({ where: { name: 'injury' } });
      }
      return Promise.all(
        // Update DB records
        objs.map((o) => NFLPlayer.update({ injuryStatus: o.injuryStatus }, {
          where: { id: o.id },
        })),
      );
    })
    .catch(logger.error);
}

interface InjuryDataType {
  data: string,
}

function Format(raw: InjuryDataType) {
  const main = raw.data.split('<tbody>')[1].split('</tbody')[0];

  const units = main.split('</tr>');

  return units.reduce((acc, u) => {
    if (!u) return acc;
    const start = u.split('data-ys-playerid="')[1];
    const [playerid, pidout] = start.split('" data-ys-playernote');
    if (!playerid) return acc;
    const statusout = pidout.split('</abbr>')[0];
    let status = statusout[statusout.length - 1];
    if (['P', 'Q', 'D'].indexOf(status) === -1) status = 'O';
    const pObj = {
      id: Number(playerid),
      injuryStatus: status,
      name: 'injury',
      NFLPositionId: 1,
      NFLTeamId: 1,
      active: false,
      preprice: null,
      postprice: null,
      jersey: 0,
    };
    acc.push(pObj);
    return acc;
  }, [] as Required<NFLPlayerCreateType>[]);
}
