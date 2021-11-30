import { client } from '../../../db/redis'
import { sendToUser } from '../socket.live'

const offerFilled = {};

offerFilled.pub = function pub(userID, offerID) {
  client.publish('offerFilled', JSON.stringify({ userID, offerID }));
};

// When a protected match is made, alert the user via ws
offerFilled.sub = function sub(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerFilled', offerID });
};

export default offerFilled;
