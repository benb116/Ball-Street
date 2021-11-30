const { client } = require('../../../db/redis');
const { sendToAll } = require('../socket.live');

const injuryUpdate = {};

injuryUpdate.pub = function pub(obj) {
  client.publish('injuryUpdate', JSON.stringify(obj));
};

injuryUpdate.sub = function sub(message) {
  sendToAll({ event: 'injuryUpdate', update: JSON.parse(message) });
};

module.exports = injuryUpdate;
