const { client } = require('../../../db/redis');
const { sendToUser } = require('../socket.live');

const protectedMatch = {};

protectedMatch.pub = function pub(obj) {
  client.publish('protectedMatch', JSON.stringify(obj));
};

// When a protected match is made, alert the user via ws
protectedMatch.sub = function sub(message) {
  const { userID, offerID, expire } = JSON.parse(message);
  sendToUser(userID, { event: 'protectedMatch', offerID, expire });
};

module.exports = protectedMatch;
