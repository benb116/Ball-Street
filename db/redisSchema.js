const schema = {
  contestN: [
    {
      playerN: [
        {
          bestbid: Number,
          bestask: Number,
          lastTradePrice: Number,
        },
      ],
    },
  ],
};

function hashkey(contestID, nflplayerID) {
  return `contest${contestID}:` + `player${nflplayerID}`;
}

function leaderHashkey(contestID) {
  return `contest${contestID}:leaderboard`
}

function priceUpdateEncode(contestID, nflplayerID, bestbid, bestask) {
  return `${contestID}:${nflplayerID} ${bestbid} ${bestask}`;
}

function priceUpdateDecode(str) {
  return {
    contestID: 0,
    nflplayerID: 0,
    bestbid: 0,
    bestask: 0,
  };
}

module.exports = {
  hashkey,
  leaderHashkey,
};
