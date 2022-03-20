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
    .then((arr) => {
      // Create a new injury object with new record set
      // If a player is no longer listed on the page, their entry is removed
      const newInjObj: typeof state.injObj = {};
      // Find objects that changed/were added
      const changedObjects = arr.filter((e) => {
        if (!e || !e.id) return false;
        const oldstatus = state.injObj[e.id]; // what was the old status
        newInjObj[e.id] = e.injuryStatus; // Set current status in new object
        delete state.injObj[e.id]; // Delete from old object
        return oldstatus !== e.injuryStatus; // Has it changed
      });

      // Remaining players were on the list but aren't any more
      const healthyPlayers = Object.keys(state.injObj);
      // Create updated for each of them as well
      healthyPlayers.forEach((playerID) => {
        changedObjects.push(GenerateInjuryObject(Number(playerID), null));
      });

      // Set the new object
      state.injObj = newInjObj;
      return changedObjects;
    })
    .then((objs) => {
      // Push out an injury update
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
      // If this is the first time through, bulk create the updates
      // Look into update with multiple ids/values
      // delete any players whose IDs we didn't already have in the system
      if (!injuryInited) {
        injuryInited = true;
        await NFLPlayer.bulkCreate(objs, { updateOnDuplicate: ['injuryStatus'] });
        return NFLPlayer.destroy({ where: { name: 'injury' } });
      }
      // Otherwise, send individual update commands
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
    const statusPreChar = statusout[statusout.length - 2];
    if (['P', 'Q', 'D'].indexOf(status) === -1) status = 'O';
    // Abbrev could be SUSP, which would otherwise be seen as P
    if (statusPreChar !== '>') status = 'O';
    acc.push(GenerateInjuryObject(Number(playerid), status));
    return acc;
  }, [] as Required<NFLPlayerCreateType>[]);
}

function GenerateInjuryObject(playerid: number, status: string | null) {
  return {
    id: playerid,
    injuryStatus: status,
    name: 'injury',
    NFLPositionId: 1,
    NFLTeamId: 1,
    active: false,
    preprice: null,
    postprice: null,
    jersey: 0,
  } as Required<NFLPlayerCreateType>;
}
