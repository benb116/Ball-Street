// Change the game phase (pre, mid, post)
import Joi from 'joi';

import { Op } from 'sequelize';
import {
  dv, tobj, validate, isPlayerOnRoster,
} from '../../features/util/util';
import { client } from '../../db/redis';
import {
  NFLPlayer, Entry, NFLGame, Contest,
} from '../../models';

import sequelize from '../../db';
import logger from '../../utilities/logger';
import state from './state.nfl';
import { SumPoints } from './dict.nfl';
import phaseChange from '../live/channels/phaseChange.channel';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  teamID: Joi.number().integer().greater(0).less(35)
    .required()
    .messages({
      'number.base': 'Team ID is invalid',
      'number.integer': 'Team ID is invalid',
      'number.greater': 'Team ID is invalid',
      'number.less': 'Team ID is invalid',
      'any.required': 'You must be specify a team',
    }),
  newphase: Joi.any().valid('pre', 'mid', 'post').required(),
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
    },
  })
    .then(() => {
      if (newphase === 'post') return convertTeamPlayers(teamID);
      return Promise.resolve();
    })
    .then(() => {
      phaseChange.pub(teamID, newphase);
    })
    .then(() => client.DEL('/app/auth/nfldata/games')); // Force a refresh of game data
}

// Convert all players on a team in all entries to points
async function convertTeamPlayers(teamID: number) {
  const teamPlayers = await NFLPlayer.findAll({
    where: {
      NFLTeamId: teamID,
      active: true,
    },
  }).then(dv);

  // Set postprice in database
  const statplayerObjs = teamPlayers.map(setPostPrice);
  await NFLPlayer.bulkCreate(statplayerObjs, { updateOnDuplicate: ['postprice'] });

  // Build statmap for use in conversion
  const statmap = statplayerObjs.reduce((acc, cur) => {
    const { id, postprice } = cur;
    acc[id] = postprice;
    return acc;
  }, {});

  // Find all of this weeks entries across contests
  const weekcontests = await Contest.findAll({
    where: { nflweek: Number(process.env.WEEK) },
  }).then(dv)
    .then((contests) => contests.map((c) => c.id));
  const allEntries = await Entry.findAll({
    where: { ContestId: { [Op.or]: weekcontests } },
  }).then(dv);

  // Filter for all entries with a player on this team
  const teamEntries = allEntries
    .filter((e) => teamPlayers
      .reduce((acc, cur) => (acc || isPlayerOnRoster(e, cur.id)), false));
  // Run in series to reduce DB load
  for (let i = 0; i < teamEntries.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await convertEntry(teamEntries[i], teamPlayers, statmap);
  }
}

// Set a player's postprice based on statlines
function setPostPrice(p) {
  const playerid = p.id;
  const stats = state.statObj[playerid];
  const statpoints = (stats ? SumPoints(stats) : 0);
  // eslint-disable-next-line no-param-reassign
  p.postprice = statpoints;
  return p;
}

// Convert any team players in an entry to points
async function convertEntry(e, players, statmap) {
  return sequelize.transaction(isoOption, async (t) => {
    const theentry = await Entry.findOne({
      where: {
        UserId: e.UserId,
        ContestId: e.ContestId,
      },
    }, tobj(t));

    players.forEach((p) => {
      const pos = isPlayerOnRoster(theentry, p.id);
      if (pos) {
        theentry[pos] = null;
        theentry.pointtotal += (statmap[p.id] || 0);
      }
    });

    await theentry.save({ transaction: t });
  });
}

export default setPhase;
