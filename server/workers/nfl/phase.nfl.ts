// Change the game phase (pre, mid, post)
import Joi from 'joi';
import { Op } from 'sequelize';

import teams from '../../nflinfo';

import {
  dv, tobj, validate, isPlayerOnRoster,
} from '../../features/util/util';
import logger from '../../utilities/logger';
import { SumPoints } from './dict.nfl';

import state from './state.nfl';

import phaseChange from '../live/channels/phaseChange.channel';

import { client } from '../../db/redis';
import sequelize from '../../db';

import Entry, { EntryType } from '../../features/entry/entry.model';
import NFLPlayer, { NFLPlayerType } from '../../features/nflplayer/nflplayer.model';
// import Contest, { ContestType } from '../../features/contest/contest.model';
import NFLGame from '../../features/nflgame/nflgame.model';
import getWeekEntries from '../../features/entry/services/getWeekEntries.service';
import EntryAction, { EntryActionType } from '../../features/trade/entryaction.model';
import { EntryActionKinds } from '../../config';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

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
async function setPhase(teamID: number, newphase: string) {
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

    // Convert players to points if game ended
    if (newphase === 'post') await convertTeamPlayers(teamID);

    // Announce phase change
    phaseChange.pub(teamID, newphase);
    // Delete cache entry
    client.DEL('/nfldata/games');
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
  const statmap = statplayerObjs.reduce((acc: Record<string, number>, cur) => {
    if (cur.postprice) acc[cur.id] = cur.postprice;
    return acc;
  }, {});

  // Find all of this weeks entries across contests
  const allEntries: EntryType[] = await getWeekEntries();

  // Filter for all entries with a player on this team
  const teamEntries = allEntries.filter(
    (e) => teamPlayers.reduce(
      (acc: boolean, cur) => (acc || (isPlayerOnRoster(e, cur.id) !== '')),
      false,
    ),
  );
  // Run in series to reduce DB load
  for (let i = 0; i < teamEntries.length; i++) {
    convertEntry(teamEntries[i], teamPlayers, statmap);
  }
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

// Convert any team players in an entry to points
async function convertEntry(e: EntryType, players: NFLPlayerType[], statmap: Record<string, number>) {
  // Operate inside a single transaction so conversion is atomic
  return sequelize.transaction(isoOption, async (t) => {
    const theentry = await Entry.findOne({
      where: {
        UserId: e.UserId,
        ContestId: e.ContestId,
      },
      ...tobj(t),
    });
    if (!theentry) return null;

    // Pull final point value for each and add to a running total
    // Also set roster spot to null
    const newSet: EntryType = {
      pointtotal: dv(theentry).pointtotal || 0,
      UserId: e.UserId,
      ContestId: e.ContestId,
    };
    // Return list of playerIDs that are converted
    const playersConverted = players.reduce((acc, p) => {
      const pos = isPlayerOnRoster(dv(theentry), p.id);
      if (pos) {
        newSet.pointtotal += (statmap[p.id] || 0);
        newSet[pos] = null;
        acc.push(p.id);
      }
      return acc;
    }, [] as number[]);

    // Update entry record
    theentry.set(newSet);
    await theentry.save({ transaction: t });

    // Write conversion records
    const entryActions = playersConverted.map((pID) => ({
      EntryActionKindId: EntryActionKinds.Convert.id,
      UserId: e.UserId,
      ContestId: e.ContestId,
      NFLPlayerId: pID,
      price: (statmap[pID] || 0),
    } as EntryActionType));
    await EntryAction.bulkCreate(entryActions, { transaction: t });

    return theentry;
  });
}

export default setPhase;
