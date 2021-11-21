const { client } = require('../../../db/redis');
const { sendToUser } = require('../socket.live');

const offerCancelled = {};

offerCancelled.pub = function pub(userID, offerID) {
  client.publish('offerCancelled', JSON.stringify({ userID, offerID }));
};

// When a protected match is made, alert the user via ws
offerCancelled.sub = function sub(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerCancelled', offerID });
};

module.exports = offerCancelled;