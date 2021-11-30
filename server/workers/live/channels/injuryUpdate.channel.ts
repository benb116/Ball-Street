import { client } from '../../../db/redis';
import { sendToAll } from '../socket.live';

const injuryUpdate = {
  pub: function pub(obj) {
    client.publish('injuryUpdate', JSON.stringify(obj));
  },
  sub: function sub(message: string) {
    sendToAll({ event: 'injuryUpdate', update: JSON.parse(message) });
  },
};

export default injuryUpdate;
