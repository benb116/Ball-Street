// Phase worker
// Change the game phase (pre, mid, post)

const { client, set } = require('../db/redis');

async function setPhase(newphase) {
  await set.GamePhase(newphase);
  client.publish('phaseChange', newphase);
}

module.exports = {
  setPhase,
};
