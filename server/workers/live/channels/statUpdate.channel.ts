import { client } from '../../../db/redis'
import { sendToAll } from '../socket.live'

const statUpdate = {};

statUpdate.pub = function pub(obj) {
  client.publish('statUpdate', JSON.stringify(obj));
};

statUpdate.sub = function sub(message) {
  sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
};

export default statUpdate;
