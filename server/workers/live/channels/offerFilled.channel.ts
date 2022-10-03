import { sendToUser } from '../socket.live';

import { client } from '@db/redis';

const offerFilled = {
  pub: function pub(userID: number, offerID: string) {
    client.publish('offerFilled', JSON.stringify({ userID, offerID }));
  },
  // When a protected match is made, alert the user via ws
  sub: function sub(message: string) {
    const { userID, offerID } = JSON.parse(message);
    sendToUser(userID, { event: 'offerFilled', offerID });
  },
};

export default offerFilled;
