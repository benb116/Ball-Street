// Change the game phase (pre, mid, post)
const Joi = require('joi');

const { Op } = require('sequelize');
const u = require('../../features/util/util');
const { client, del, get } = require('../../db/redis');
const {
  NFLPlayer, Entry, NFLGame, Contest,
} = require('../../models');

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
      if (newphase === 'post') return convertTeamPlayers(teamID);
      return Promise.resolve();
    })
    .then(() => {
      client.publish('phaseChange', JSON.stringify({
        nflTeamID: teamID,
        gamePhase: newphase,
      }));
    })
    .then(() => del.key('/app/auth/nfldata/games')); // Force a refresh of game data
}

// Convert all players on a team in all entries to points
async function convertTeamPlayers(teamID) {
  const teamPlayers = await NFLPlayer.findAll({
    where: {
      NFLTeamId: teamID,
      active: true,
    },
  }).then(u.dv);

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
    where: { nflweek: await get.CurrentWeek() },
  }).then(u.dv)
    .then((contests) => contests.map((c) => c.id));
  const allEntries = await Entry.findAll({
    where: { ContestId: { [Op.or]: weekcontests } },
  }).then(u.dv);

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
function setPostPrice(p) {
  const playerid = p.id;
  const stats = state.statObj[playerid];
  const statpoints = (stats ? dict.SumPoints(stats) : 0);
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
