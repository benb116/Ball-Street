// Get all injured players
// Find changes and send out updates

import axios from 'axios';

import logger from '../../utilities/logger';

import state from './state.nfl';

import injuryUpdate, { InjuryUpdateType } from '../live/channels/injuryUpdate.channel';

import NFLPlayer from '../../features/nflplayer/nflplayer.model';

export default async function PullLatestInjuries() {
  return axios.get('https://football.fantasysports.yahoo.com/f1/injuries')
    .then(Format)
    .then((arr) => arr.filter((e) => {
      // Update injobj and return players that changed
      if (!e) return false;
      const oldstatus = state.injObj[e.nflplayerID];
      state.injObj[e.nflplayerID] = e.status;
      return oldstatus !== e.status;
    }))
    .then((objs: InjuryType[]) => {
      // Pushout updates for each
      if (!objs.length) return objs;
      const outObj = objs.reduce((acc, cur) => {
        acc[cur.nflplayerID] = cur.status;
        return acc;
      }, {} as InjuryUpdateType);

      injuryUpdate.pub(outObj);
      return objs;
    })
    .then((objs) => Promise.all(
      // Update DB records
      objs.map((o) => NFLPlayer.update({ injuryStatus: o.status }, {
        where: { id: o.nflplayerID },
      })),
    ))
    .catch(logger.error);
}

interface InjuryDataType {
  data: string,
}
interface InjuryType {
  nflplayerID: number,
  status: string,
}

function Format(raw: InjuryDataType) {
  const main = raw.data.split('<tbody>')[1].split('</tbody')[0];

  const units = main.split('</tr>');

  return units.filter((u: string) => u.length).map((u) => {
    const start = u.split('data-ys-playerid="')[1];
    const [playerid, pidout] = start.split('" data-ys-playernote');
    const statusout = pidout.split('</abbr>')[0];
    let status = statusout[statusout.length - 1];
    if (['P', 'Q', 'D'].indexOf(status) === -1) status = 'O';
    return {
      nflplayerID: Number(playerid),
      status,
    } as InjuryType;
  });
}
