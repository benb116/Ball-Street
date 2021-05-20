// phaseChange

const redis = require('redis');
const { setGamePhase } = require('../features/util/util.service');

const client = redis.createClient();

async function setPhase(newphase) {
  await setGamePhase(newphase);
  client.publish('phaseChange', newphase);
}
