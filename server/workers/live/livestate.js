function liveState() {
  this.connmap = new Map(); // Which ws connection corresponds to which user
  this.contestmap = new Map(); // Which ws connection corresponds to which contest
  this.priceUpdateMap = {}; // Keep an account of changes, will be flushed on interval
  this.statUpdateMap = {}; // Keep an account of changes, will be flushed on interval
  this.lastTradeMap = {}; // Keep an account of changes, will be flushed on interval
  return this;
}

const out = liveState();

module.exports = out;
