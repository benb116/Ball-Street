const { client } = require('../../../db/redis');
const { sendToAll } = require('../socket.live');

const phaseChange = {};

phaseChange.pub = function pub(nflTeamID, gamePhase) {
  client.publish('phaseChange', JSON.stringify({ nflTeamID, gamePhase }));
};

phaseChange.sub = function sub(message) {
  sendToAll({ event: 'phaseChange', phase: JSON.parse(message) });
};

module.exports = phaseChange;
