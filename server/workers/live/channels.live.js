const priceUpdate = require('./channels/priceUpdate.channel');
const statUpdate = require('./channels/statUpdate.channel');
const leaderUpdate = require('./channels/leaderUpdate.channel');
const protectedMatch = require('./channels/protectedMatch.channel');
const offerFilled = require('./channels/offerFilled.channel');
const offerCancelled = require('./channels/offerCancelled.channel');
const phaseChange = require('./channels/phaseChange.channel');
const injuryUpdate = require('./channels/injuryUpdate.channel');

const channelMap = {
  priceUpdate,
  statUpdate,
  leaderUpdate,
  protectedMatch,
  offerFilled,
  offerCancelled,
  phaseChange,
  injuryUpdate,
};

module.exports = channelMap;
