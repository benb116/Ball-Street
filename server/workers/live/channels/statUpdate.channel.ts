const { client } = require('../../../db/redis');
const { sendToAll } = require('../socket.live');

const statUpdate = {};

statUpdate.pub = function pub(obj) {
  client.publish('statUpdate', JSON.stringify(obj));
};

statUpdate.sub = function sub(message) {
  sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
};

module.exports = statUpdate;
