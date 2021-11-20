const { sendToUser } = require('../socket.live');

// When a protected match is made, alert the user via ws
function protectedMatch(message) {
  const { userID, offerID, expire } = JSON.parse(message);
  sendToUser(userID, { event: 'protectedMatch', offerID, expire });
}

module.exports = protectedMatch;
