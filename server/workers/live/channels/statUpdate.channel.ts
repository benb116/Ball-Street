import { client } from '../../../db/redis';
import { sendToAll } from '../socket.live';

const statUpdate = {
  pub: function pub(obj) {
    client.publish('statUpdate', JSON.stringify(obj));
  },
  sub: function sub(message: string) {
    sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
  },
};

export default statUpdate;
