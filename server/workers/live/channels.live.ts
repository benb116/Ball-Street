// All channels for redis pub/sub

import priceUpdate from './channels/priceUpdate.channel';
import statUpdate from './channels/statUpdate.channel';
import leaderUpdate from './channels/leaderUpdate.channel';
import protectedMatch from './channels/protectedMatch.channel';
import offerFilled from './channels/offerFilled.channel';
import offerCancelled from './channels/offerCancelled.channel';
import phaseChange from './channels/phaseChange.channel';
import injuryUpdate from './channels/injuryUpdate.channel';

interface LiveChannel {
  sub(message: string): void,
  pub(...args: unknown[]): void,
}

const channelMap: Record<string, LiveChannel> = {
  priceUpdate,
  statUpdate,
  leaderUpdate,
  protectedMatch,
  offerFilled,
  offerCancelled,
  phaseChange,
  injuryUpdate,
};

export default channelMap;
