import { client } from '../../../db/redis';
import { sendToAll } from '../socket.live';

const phaseChange = {
  pub: function pub(nflTeamID: number, gamePhase: string) {
    client.publish('phaseChange', JSON.stringify({ nflTeamID, gamePhase }));
  },
  sub: function sub(message: string) {
    const phase = JSON.parse(message);
    sendToAll({ event: 'phaseChange', phase });
  },
};

export default phaseChange;
