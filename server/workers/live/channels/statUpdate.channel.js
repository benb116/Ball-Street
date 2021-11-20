const { sendToAll } = require('../socket.live');

function statUpdate(message) {
  sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
}

module.exports = statUpdate;
