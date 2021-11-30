const out = {
  connmap: new Map(), // Which ws connection corresponds to which user
  contestmap: new Map(), // Which ws connection corresponds to which contest
  priceUpdateMap: {}, // Keep an account of changes, will be flushed on interval
};

export default out;
