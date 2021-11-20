const { sendToAll } = require('../socket.live');

function phaseChange(message) {
  sendToAll({ event: 'phaseChange', phase: JSON.parse(message) });
}

module.exports = phaseChange;
