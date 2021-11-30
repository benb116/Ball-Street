// Get all injured players
// Find changes and send out updates

import axios from 'axios';
import { NFLPlayer } from '../../models';
import injuryUpdate from '../live/channels/injuryUpdate.channel';
import state from './state.nfl';

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
    .then((objs) => {
      // Pushout updates for each
      if (!objs.length) return objs;
      const outObj = objs.reduce((acc, cur) => {
        acc[cur.nflplayerID] = {};
        acc[cur.nflplayerID].status = cur.status;
        return acc;
      }, {});

      injuryUpdate.pub(outObj);
      return objs;
    })
    .then((objs) => Promise.all(
      // Update DB records
      objs.map((o) => NFLPlayer.update({ injuryStatus: o.status }, {
        where: { id: o.nflplayerID },
      })),
    ));
}

function Format(raw) {
  const main = raw.data.split('<tbody>')[1].split('</tbody')[0];

  const units = main.split('</tr>');

  return units.map((u) => {
    if (!u.length) return null;
    const start = u.split('data-ys-playerid="')[1];
    const [playerid, pidout] = start.split('" data-ys-playernote');
    const statusout = pidout.split('</abbr>')[0];
    let status = statusout[statusout.length - 1];
    if (['P', 'Q', 'D'].indexOf(status) === -1) status = 'O';
    return {
      nflplayerID: Number(playerid),
      status,
    };
  });
}
