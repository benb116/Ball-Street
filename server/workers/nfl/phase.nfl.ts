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

  return NFLGame.update({ phase: newphase }, {
    where: {
      [Op.or]: [{ HomeId: teamID }, { AwayId: teamID }],
      week: Number(process.env.WEEK),
    },
  })
    .then(() => {
      if (newphase === 'post') return convertTeamPlayers(teamID);
      return Promise.resolve();
    })
    .then(() => { phaseChange.pub(teamID, newphase); })
    .then(() => client.DEL('/nfldata/games')) // Force a refresh of game data
    .catch(logger.error);
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
  const playerid = p.id;
  const stats = state.statObj[playerid];
  const statpoints = (stats ? SumPoints(stats) : 0);
  // eslint-disable-next-line no-param-reassign
  p.postprice = statpoints;
  return p;
}

// Convert any team players in an entry to points
async function convertEntry(
  e: EntryType, players: NFLPlayerType[], statmap: Record<string, number>,
) {
  return sequelize.transaction(isoOption, async (t) => {
    const theentry = await Entry.findOne({
      where: {
        UserId: e.UserId,
        ContestId: e.ContestId,
      },
      ...tobj(t),
    });
    if (!theentry) return null;
    players.forEach((p) => {
      const pos = isPlayerOnRoster(dv(theentry), p.id);
      if (pos) {
        const newSet: Record<string, number | null> = {
          pointtotal: dv(theentry).pointtotal += (statmap[p.id] || 0),
        };
        newSet[pos] = null;
        theentry.set(newSet);
      }
    });

    await theentry.save({ transaction: t });
    return theentry;
  });
}

export default setPhase;
