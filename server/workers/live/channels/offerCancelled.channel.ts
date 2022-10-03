import { client } from '@db/redis';
import { sendToUser } from '../socket.live';

const offerCancelled = {
  pub: function pub(userID: number, offerID: string) {
    client.publish('offerCancelled', JSON.stringify({ userID, offerID }));
  },
  // When a protected match is made, alert the user via ws
  sub: function sub(message: string) {
    const { userID, offerID } = JSON.parse(message);
    sendToUser(userID, { event: 'offerCancelled', offerID });
  },
};

export default offerCancelled;
