// Change the game phase (pre, mid, post)
import Joi from 'joi';
import { Op, Sequelize } from 'sequelize';

import type { Literal } from 'sequelize/types/utils.d';
import teams from '../../nflinfo';

import { dv, validate, isPlayerOnRoster } from '../../features/util/util';
import logger from '../../utilities/logger';
import { SumPoints } from './dict.nfl';

import state from './state.nfl';

import phaseChange from '../live/channels/phaseChange.channel';

import { client } from '../../db/redis';

import Entry, { EntryType } from '../../features/entry/entry.model';
import NFLPlayer, { NFLPlayerType } from '../../features/nflplayer/nflplayer.model';
// import Contest, { ContestType } from '../../features/contest/contest.model';
import NFLGame from '../../features/nflgame/nflgame.model';
import getWeekEntries from '../../features/entry/services/getWeekEntries.service';
import EntryAction, { EntryActionType } from '../../features/trade/entryaction.model';
import { EntryActionKinds } from '../../config';

const teamIDs = Object.keys(teams).map((teamAbr) => teams[teamAbr].id);
const schema = Joi.object({
  teamID: Joi.valid(...teamIDs)
    .required()
    .messages({
      'number.base': 'Team ID is invalid',
      'number.integer': 'Team ID is invalid',
      'number.greater': 'Team ID is invalid',
      'number.less': 'Team ID is invalid',
      'any.required': 'You must be specify a team',
    }),
  newphase: Joi.string().valid('pre', 'mid', 'post').required(),
});

// Mark a team's phase in the DB, then publish a change to clients
// If changed to post, then convert players to points
async function setPhase(teamID: number, newphase: 'pre' | 'mid' | 'post') {
  const req = { teamID, newphase };
  validate(req, schema);

  logger.info(`Team ${teamID} phase set to ${newphase}`);
  try {
    // Update DB
    await NFLGame.update({ phase: newphase }, {
      where: {
        [Op.or]: [{ HomeId: teamID }, { AwayId: teamID }],
        week: Number(process.env.WEEK),
      },
    });

    // Announce phase change
    phaseChange.pub(teamID, newphase);
    // Delete cache entry
    client.DEL('/nfldata/games');

    // Convert players to points if game ended
    if (newphase === 'post') await convertTeamPlayers(teamID);
  } catch (error) {
    logger.error(error);
  }
}

// Convert all players on a team in all entries to points
async function convertTeamPlayers(teamID: number) {
  logger.info(`Converting players on team ${teamID}`);
  const teamPlayers: NFLPlayerType[] = await NFLPlayer.findAll({
    where: {
      NFLTeamId: teamID,
      active: true,
    },
  }).then(dv);

  // Set postprice in database
  const statplayerObjs = teamPlayers.map(setPostPrice);
  NFLPlayer.bulkCreate(statplayerObjs, { updateOnDuplicate: ['postprice'] });

  // Build statmap for use in conversion
  // PlayerID: postprice
  const statmap = statplayerObjs.reduce((acc: Record<string, number>, cur) => {
    if (cur.postprice) acc[cur.id] = cur.postprice;
    return acc;
  }, {});

  // Find all of this weeks entries across contests
  const allEntries: EntryType[] = await getWeekEntries();

  // Determine which players on which entries should be converted
  // Map (key: entry, value: Map of roster positions and playerIDs)
  const changeMap = allEntries.reduce((acc: Map<EntryType, Map<string, number>>, entry) => {
    // map of positions and players to convert
    const entryPlayers: Map<string, number> = new Map();

    let exists = false;
    teamPlayers.forEach((p) => {
      const position = isPlayerOnRoster(entry, p.id);
      if (position) {
        exists = true;
        entryPlayers.set(position, p.id);
      }
    });
    if (exists) acc.set(entry, entryPlayers); // If there are any, add to the map of all entries
    return acc;
  }, new Map());

  // For each entry with changes, calculate new values (roster and pointtotal) and send atomic update
  changeMap.forEach((value, key) => {
    const { UserId, ContestId } = key;
    const updatedProps: Record<string, null | Literal> = {};
    let addSum = 0;
    value.forEach((pID, pos) => { updatedProps[pos] = null; addSum += (statmap[pID] || 0); });
    updatedProps.pointtotal = Sequelize.literal(`pointtotal + ${addSum.toString()}`);
    Entry.update(updatedProps, { where: { UserId, ContestId } });
  });
}

// Set a player's postprice based on statlines
function setPostPrice(p: NFLPlayerType) {
  const newp = p;
  const playerid = newp.id;
  const stats = state.statObj[playerid];
  const statpoints = (stats ? SumPoints(stats) : 0);
  newp.postprice = statpoints;
  return p;
}

export default setPhase;
