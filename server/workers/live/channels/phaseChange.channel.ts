import { client } from '../../../db/redis';
import { sendToAll } from '../socket.live';

const phaseChange = {};

phaseChange.pub = function pub(nflTeamID, gamePhase) {
  client.publish('phaseChange', JSON.stringify({ nflTeamID, gamePhase }));
};

phaseChange.sub = function sub(message) {
  sendToAll({ event: 'phaseChange', phase: JSON.parse(message) });
};

export default phaseChange;
