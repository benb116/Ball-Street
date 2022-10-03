import { sendToAll } from '../socket.live';

import { client } from '@db/redis';

export interface StatUpdateType {
  nflplayerID: number,
  statPrice: number,
  projPrice: number,
}

const statUpdate = {
  pub: function pub(obj: Record<string, StatUpdateType>) {
    client.publish('statUpdate', JSON.stringify(obj));
  },
  sub: function sub(message: string) {
    sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
  },
};

export default statUpdate;
