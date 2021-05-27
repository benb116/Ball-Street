// Phase worker
// Change the game phase (pre, mid, post)

const u = require('../features/util/util');
const { client } = require('../db/redis');
const { NFLPlayer, NFLTeam, Entry } = require('../models');
const getWeekEntries = require('../features/entry/services/getWeekEntries.service');

const sequelize = require('../db');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

async function setPhase(teamID, newphase) {
  return NFLTeam.update({
    gamePhase: newphase,
  },
  {
    where: {
      id: teamID,
    },
  })
    .then(() => {
      if (newphase === 'post') {
        return convertTeamPlayers(teamID);
      }
      return Promise.resolve();
    })
    .then(() => {
      client.publish('phaseChange', JSON.stringify({
        nflTeamID: teamID,
        gamePhase: newphase,
      }));
    });
}

// TODO - make sure that postprice is updated with final value before converting
async function convertTeamPlayers(teamID) {
  const teamPlayers = await NFLPlayer.findAll({
    include: [{ model: NFLTeam }],
    where: {
      NFLTeamId: teamID,
    },
  }).then(u.dv);

  const allEntries = await getWeekEntries();
  const teamEntries = allEntries
    .filter((e) => teamPlayers
      .reduce((acc, cur) => (acc || u.isPlayerOnRoster(e, cur.id)), false));

  const allTransactions = teamEntries.map((e) => convertEntry(e, teamPlayers));
  return Promise.all(allTransactions);
}

async function convertEntry(e, players) {
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
        theentry.pointtotal += p.postprice;
      }
    });

    await theentry.save({ transaction: t });
  });
}

module.exports = {
  setPhase,
  convertTeamPlayers,
};
