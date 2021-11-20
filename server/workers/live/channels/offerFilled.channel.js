const { sendToUser } = require('../socket.live');

// When a protected match is made, alert the user via ws
function offerFilled(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerFilled', offerID });
}

module.exports = offerFilled;
