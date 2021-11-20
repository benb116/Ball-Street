const { sendToUser } = require('../socket.live');

// When a protected match is made, alert the user via ws
function offerCancelled(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerCancelled', offerID });
}

module.exports = offerCancelled;
