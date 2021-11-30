import { client } from '../../../db/redis';
import { sendToUser } from '../socket.live';

const protectedMatch = {
  pub: function pub(obj) {
    client.publish('protectedMatch', JSON.stringify(obj));
  },
  // When a protected match is made, alert the user via ws
  sub: function sub(message: string) {
    const { userID, offerID, expire } = JSON.parse(message);
    sendToUser(userID, { event: 'protectedMatch', offerID, expire });
  },
};

export default protectedMatch;
