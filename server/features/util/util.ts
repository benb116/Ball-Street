import config from '../../config'
import logger from '../../utilities/logger'

const rpos = Object.keys(config.Roster);

// Clean up the raw response from the database
export const dv = function dv(input) {
  if (input === null) { return input; }
  if (input.length) { return input.map(dv); }
  if (input.toJSON) { return input.toJSON(); }
  return input;
};

// Return whether a player type (number) cannot be put into a specific roster position
export const isInvalidSpot = function isInvalidSpot(playerType, rosterPosName) {
  const rosterType = config.Roster[rosterPosName];
  if (playerType === rosterType) {
    return false;
  }
  if (rosterType === config.FlexNFLPositionId) {
    const playercanflex = config.NFLPosTypes[playerType].canflex;
    if (playercanflex) {
      return false;
    }
    return 'Trying to put a non-flex player in a flex position!';
  }
  return 'Trying to put a player in an incorrect position!';
};

// Is a player on the entry's roster
export const isPlayerOnRoster = function isPlayerOnRoster(entry, playerID) {
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
export const isOpenRoster = function isOpenRoster(theentry, playerType) {
  for (let i = 0; i < rpos.length; i++) {
    if (theentry[rpos[i]] === null && !(isInvalidSpot(playerType, rpos[i]))) {
      return rpos[i];
    }
  }
  return false;
};

// Transaction object to cause SELECT ... FOR UPDATE
export const tobj = function tobj(t) {
  return {
    transaction: t,
    lock: t.LOCK.UPDATE,
  };
};

// Custom error function that returns a msg and http status
export const uError = function uError(msg, status = 500) {
  const err = new Error(msg);
  err.status = status;
  throw err;
};

// Console.log passthrough for promises
export const cl = function cl(input) {
  // eslint-disable-next-line no-console
  logger.info(input);
  return input;
};

// Validate an object based on a Joi schema
export const validate = function validate(input, schema) {
  const { value, error } = schema.validate(input);
  if (error) { uError(error.details[0].måœessage, 400); }
  return value;
};

// Functions used in Jest testing
// Ensures that a service call returns an object with specific properties
export const ObjectTest = function ObjectTest(service, req, contains) {
  return async () => service(req).then((resp) => {
    expect(resp).toEqual(expect.objectContaining(contains));
  });
};

// Ensures that a service call returns an array with specific elements
export const ArrayTest = function ArrayTest(service, req, items) {
  return async () => service(req).then((resp) => {
    items.forEach((e) => {
      let check = e;
      if (typeof check === 'object' && check !== null) {
        check = expect.objectContaining(e);
      }
      expect(resp).toContainEqual(check);
    });
  });
};

// Ensures that a service call throws an error with specific status number and message
export const ErrorTest = function ErrorTest(service, req, statusNumber, message) {
  return async function errortest() {
    try {
      const o = await service(req);
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!err.status) { console.log(err); }
      expect(err.message).toEqual(message);
      expect(err.status).toEqual(statusNumber);
    }
  };
};

// Compare strings in constant time
// https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
export const OnCompare = function OnCompare(a, b) {
  let mismatch = 0;
  for (let i = 0; i < a.length; ++i) {
    // eslint-disable-next-line no-bitwise
    mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return mismatch;
};
