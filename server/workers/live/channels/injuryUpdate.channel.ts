import { sendToAll } from '../socket.live';

import { client } from '../../../db/redis';

export interface InjuryUpdateType {
  [key: string]: string
}

const injuryUpdate = {
  pub: function pub(obj: InjuryUpdateType) {
    client.publish('injuryUpdate', JSON.stringify(obj));
  },
  sub: function sub(message: string) {
    sendToAll({ event: 'injuryUpdate', update: JSON.parse(message) });
  },
};

export default injuryUpdate;
