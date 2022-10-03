import { sendToAll } from '../socket.live';

import { client } from '@db/redis';

const phaseChange = {
  pub: function pub(nflTeamID: number, gamePhase: string) {
    client.publish('phaseChange', JSON.stringify({ nflTeamID, gamePhase }));
  },
  sub: function sub(message: string) {
    sendToAll({ event: 'phaseChange', phase: JSON.parse(message) });
  },
};

export default phaseChange;
