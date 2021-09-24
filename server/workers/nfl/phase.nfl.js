// Change the game phase (pre, mid, post)
const Joi = require('joi');

const { Op } = require('sequelize');
const u = require('../../features/util/util');
const { client, del } = require('../../db/redis');
const { NFLPlayer, Entry, NFLGame } = require('../../models');
const getWeekEntries = require('../../features/entry/services/getWeekEntries.service');

const sequelize = require('../../db');
const logger = require('../../utilities/logger');
const state = require('./state.nfl');
const dict = require('./dict.nfl');

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
async function setPhase(teamID, newphase) {
  const req = { teamID, newphase };
  u.validate(req, schema);

  logger.info(`Team ${teamID} phase set to ${newphase}`);

  return NFLGame.update({ phase: newphase }, {
    where: {
      [Op.or]: [{ HomeId: teamID }, { AwayId: teamID }],
    },
  })
    .then(() => {
      client.publish('phaseChange', JSON.stringify({
        nflTeamID: teamID,
        gamePhase: newphase,
      }));
    })
    .then(() => {
      if (newphase === 'post') return convertTeamPlayers(teamID);
      return Promise.resolve();
    })
    .then(() => del.key('/app/auth/nfldata/games')); // Force a refresh of game data
}

// Convert all players on a team in all entries to points
async function convertTeamPlayers(teamID) {
  const teamPlayers = await NFLPlayer.findAll({
    where: {
      NFLTeamId: teamID,
    },
  }).then(u.dv);
  // Set postprice in database
  // Bulk create with update on duplicate?
  const statPromises = teamPlayers.map((p) => setPostPrice(p.id));
  const statout = await Promise.all(statPromises);
  const statmap = statout.reduce((acc, cur) => {
    const [pid, val] = cur;
    acc[pid] = val;
    return acc;
  }, {});

  // Find all of this weeks entries across contests
  const allEntries = await getWeekEntries();
  // Filter for all entries with a player on this team
  const teamEntries = allEntries
    .filter((e) => teamPlayers
      .reduce((acc, cur) => (acc || u.isPlayerOnRoster(e, cur.id)), false));
  // Run in series to reduce DB load
  for (let i = 0; i < teamEntries.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await convertEntry(teamEntries[i], teamPlayers, statmap);
  }
}

// Set a player's postprice based on statlines
async function setPostPrice(playerid) {
  const stats = state.statObj[playerid];
  const statpoints = (stats ? Math.round(100 * (dict.SumPoints(stats))) : 0);
  await NFLPlayer.update({ postprice: statpoints }, { where: { id: playerid } });
  return [playerid, statpoints];
}

// Convert any team players in an entry to points
async function convertEntry(e, players, statmap) {
  return sequelize.transaction(isoOption, async (t) => {
    const theentry = await Entry.findOne({
      where: {
        UserId: e.UserId,
        ContestId: e.ContestId,
      },
    }, u.tobj(t));

    players.forEach((p) => {
      const pos = u.isPlayerOnRoster(theentry, p.id);
      if (pos) {
        theentry[pos] = null;
        theentry.pointtotal += (statmap[p.id] || 0);
      }
    });

    await theentry.save({ transaction: t });
  });
}

module.exports = setPhase;
