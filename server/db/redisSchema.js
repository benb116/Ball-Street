// Common functions for dealing with redis

function hashkey(contestID, nflplayerID) {
  return `contest${contestID}:` + `player${nflplayerID}`;
}

function leaderHashkey(contestID) {
  return `contest${contestID}:leaderboard`;
}

function gamePhaseKey() {
  return 'gamePhase'; // "pre", "mid", "post"
}

function currentWeekKey() {
  return 'currentWeek';
}

module.exports = {
  hashkey,
  leaderHashkey,
  gamePhaseKey,
  currentWeekKey,
};
