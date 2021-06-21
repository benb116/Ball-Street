const getNFLPlayer = require('./services/getNFLPlayer.service');
const getNFLPlayerNumAdds = require('./services/getNFLPlayerNumAdds.service');
const getNFLPlayerOfferSummary = require('./services/getNFLPlayerOfferSummary.service');
const getNFLPlayers = require('./services/getNFLPlayers.service');
const getNFLPlayerTradeVolume = require('./services/getNFLPlayerTradeVolume.service');
const getNFLPlayerPriceHistory = require('./services/getNFLPlayerPriceHistory.service');

module.exports = {
  getNFLPlayer,
  getNFLPlayerNumAdds,
  getNFLPlayerOfferSummary,
  getNFLPlayers,
  getNFLPlayerTradeVolume,
  getNFLPlayerPriceHistory,
};
