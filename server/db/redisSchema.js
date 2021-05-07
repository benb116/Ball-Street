// Common functions for dealing with redis

function hashkey(contestID, nflplayerID) {
  return `contest${contestID}:` + `player${nflplayerID}`;
}

function leaderHashkey(contestID) {
  return `contest${contestID}:leaderboard`;
}

module.exports = {
  hashkey,
  leaderHashkey,
};
