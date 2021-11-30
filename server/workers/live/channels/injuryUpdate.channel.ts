import { client } from '../../../db/redis'
import { sendToAll } from '../socket.live'

const injuryUpdate = {};

injuryUpdate.pub = function pub(obj) {
  client.publish('injuryUpdate', JSON.stringify(obj));
};

injuryUpdate.sub = function sub(message) {
  sendToAll({ event: 'injuryUpdate', update: JSON.parse(message) });
};

export default injuryUpdate;
