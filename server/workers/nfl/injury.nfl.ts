// Get all injured players
// Find changes and send out updates

import axios from 'axios';

import logger from '../../utilities/logger';

import state from './state.nfl';

import injuryUpdate, { InjuryUpdateType } from '../live/channels/injuryUpdate.channel';

import NFLPlayer from '../../features/nflplayer/nflplayer.model';
import yahooData from '../tests/yahooData';

let injuryInited = false;

export default async function PullLatestInjuries() {
  try {
    const rawInjury = await pullInjuryData();
    const injuryObjects = FormatInjuryObjects(rawInjury.data);
    const injuryChanges = FindInjuryChanges(injuryObjects);
    return await PublishInjuryChanges(injuryChanges);
  } catch (error) {
    logger.error(error);
    return [];
  }
}

// Pull injury data from yahoo or mock data
function pullInjuryData() {
  if (Number(process.env.YAHOO_MOCK)) {
    return yahooData.injury;
  }
  return axios.get('https://football.fantasysports.yahoo.com/f1/injuries');
}

// Determine which players' injury status has changed
// If a player is no longer listed on the page, their entry is removed
export function FindInjuryChanges(injuryObjs: NFLPlayer[]) {
  const newInjObj: typeof state.injObj = {};
  // Find objects that changed/were added
  const changedObjects = injuryObjs.filter((e) => {
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
}

async function PublishInjuryChanges(changedInjuries: NFLPlayer[]) {
  // If any changed, send out an update
  if (changedInjuries.length) {
    const outObj = changedInjuries.reduce((acc, cur) => {
      if (cur && cur.id) acc[cur.id] = cur.injuryStatus;
      return acc;
    }, {} as InjuryUpdateType);
    injuryUpdate.pub(outObj);
  }

  // If this is the first run through, create any player records
  if (!injuryInited) {
    injuryInited = true;
    await NFLPlayer.bulkCreate(changedInjuries, { updateOnDuplicate: ['injuryStatus'] });
    return NFLPlayer.destroy({ where: { name: 'injury' } });
  }
  return Promise.all(
    // Update DB records
    changedInjuries.map((o) => NFLPlayer.update({ injuryStatus: o.injuryStatus }, {
      where: { id: o.id },
    })),
  );
}

export function FormatInjuryObjects(raw: string) {
  const main = raw.split('<tbody>')[1].split('</tbody')[0];

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
  }, [] as NFLPlayer[]);
}

// This is an object that will "upserted" into the players table
// So it must have all of the required attributes
// But because we will only update the injuryStatus field on duplicate
// We can leave all other fields standard
function GenerateInjuryObject(playerid: number, status: string | null) {
  return new NFLPlayer({
    id: playerid,
    injuryStatus: status,
    name: 'injury',
    NFLPositionId: 1,
    NFLTeamId: 1,
    active: false, // If this was a new player record, don't show in results
    preprice: null,
    postprice: null,
  });
}
