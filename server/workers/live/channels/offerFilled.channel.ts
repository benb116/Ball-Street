const { client } = require('../../../db/redis');
const { sendToUser } = require('../socket.live');

const offerFilled = {};

offerFilled.pub = function pub(userID, offerID) {
  client.publish('offerFilled', JSON.stringify({ userID, offerID }));
};

// When a protected match is made, alert the user via ws
offerFilled.sub = function sub(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerFilled', offerID });
};

module.exports = offerFilled;
