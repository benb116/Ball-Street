const out = {};

const config = require('../../config');

const rpos = Object.keys(config.Roster);

// Clean up the raw response from the database
out.dv = function dv(input) {
  if (input === null) { return input; }
  if (input.length) { return input.map(out.dv); }
  if (input.toJSON) { return input.toJSON(); }
  return input;
};

// Return whether a player type cannot be put into a specific roster position
// isInvalidSpot('WR', 'WR1') === false
// isInvalidSpot('WR', 'FLEX1') === false
// isInvalidSpot('WR', 'RB2') === true
out.isInvalidSpot = function isInvalidSpot(playerType, rosterPosName) {
  const rosterType = config.Roster[rosterPosName];
  if (playerType === rosterType) {
    return false;
  } if (rosterType === config.FlexNFLPositionId) {
    const playercanflex = config.NFLPosTypes[playerType].canflex;
    if (playercanflex) {
      return false;
    }
    return 'Trying to put a non-flex player in a flex position!';
  }
  return 'Trying to put a player in an incorrect position!';
};

// Is a player on the entry's roster
out.isPlayerOnRoster = function isPlayerOnRoster(entry, playerID) {
  let res = false;
  for (let i = 0; i < rpos.length; i++) {
    if (entry[rpos[i]] === playerID) {
      res = rpos[i];
      break;
    }
  }
  return res;
};

// Could a player type be put into a spot on the roster
// Is the spot open AND is the player type valid
out.isOpenRoster = function isOpenRoster(theentry, playerType) {
  for (let i = 0; i < rpos.length; i++) {
    if (theentry[rpos[i]] === null && !(out.isInvalidSpot(playerType, rpos[i]))) {
      return rpos[i];
    }
  }
  return false;
};

// Transaction object to cause SELECT ... FOR UPDATE
out.tobj = function tobj(t) {
  return {
    transaction: t,
    lock: t.LOCK.UPDATE,
  };
};

// Custom error function that returns a msg and http status
out.Error = function uError(msg, status = 500) {
  const err = new Error(msg);
  err.status = status;
  throw err;
};

// Console.log passthrough for promises
out.cl = function cl(input) {
  // eslint-disable-next-line no-console
  console.log(input);
  return input;
};

module.exports = out;
