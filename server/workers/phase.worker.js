// phaseChange

const { setGamePhase } = require('../features/util/util.service');

const { client } = require('../db/redis');

async function setPhase(newphase) {
  await setGamePhase(newphase);
  client.publish('phaseChange', newphase);
}

module.exports = {
  setPhase,
};
