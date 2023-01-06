import { client } from '../../../db/redis';
import { sendToAll } from '../socket.live';

import type { PlayerValType } from '../../../../types/messages/statUpdate.message';

const statUpdate = {
  pub: function pub(obj: Record<number, PlayerValType>) {
    client.publish('statUpdate', JSON.stringify(obj));
  },
  sub: function sub(message: string) {
    const pricedata = JSON.parse(message) as Record<number, PlayerValType>;
    sendToAll({ event: 'statUpdate', pricedata });
  },
};

export default statUpdate;
