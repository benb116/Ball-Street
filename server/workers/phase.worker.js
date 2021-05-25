// Phase worker
// Change the game phase (pre, mid, post)

const { client } = require('../db/redis');
const { NFLTeam } = require('../models');

async function setPhase(teamID, newphase) {
  return NFLTeam.update({
    gamePhase: newphase,
  },
  {
    where: {
      id: teamID,
    },
  }).then(() => {
    client.publish('phaseChange', JSON.stringify({
      nflTeamID: teamID,
      gamePhase: newphase,
    }));
  });
}

module.exports = {
  setPhase,
};
