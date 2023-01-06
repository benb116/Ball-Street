// All channels for redis pub/sub

import injuryUpdate from './channels/injuryUpdate.channel';
import offerCancelled from './channels/offerCancelled.channel';
import offerFilled from './channels/offerFilled.channel';
import phaseChange from './channels/phaseChange.channel';
import priceUpdate from './channels/priceUpdate.channel';
import projAvgUpdate from './channels/projAvgUpdate.channel';
import protectedMatch from './channels/protectedMatch.channel';
import statUpdate from './channels/statUpdate.channel';

const channelMap = {
  priceUpdate,
  statUpdate,
  projAvgUpdate,
  protectedMatch,
  offerFilled,
  offerCancelled,
  phaseChange,
  injuryUpdate,
} as const;

type ChannelType = keyof typeof channelMap;
export const channelTypes = Object.keys(channelMap) as ChannelType[];

export default channelMap;
