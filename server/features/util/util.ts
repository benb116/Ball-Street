import { Schema } from 'joi';
import { Transaction } from 'sequelize';
import { FlexNFLPositionId, NFLPosTypes, Roster } from '../../config';
import logger from '../../utilities/logger';
import { ServiceInput, ServiceType } from './util.service';

const rpos = Object.keys(Roster);

// Clean up the raw response from the database
export const dv = function dv(input: any) {
  if (input === null) { return input; }
  if (input.length) { return input.map(dv); }
  if (input.toJSON) { return input.toJSON(); }
  return input;
};

// Return whether a player type (number) cannot be put into a specific roster position
export const isInvalidSpot = function isInvalidSpot(playerType: number, rosterPosName: string) {
  const rosterType = Roster[rosterPosName];
  if (playerType === rosterType) {
    return false;
  }
  if (rosterType === FlexNFLPositionId) {
    const playercanflex = NFLPosTypes[playerType].canflex;
    if (playercanflex) {
      return false;
    }
    return 'Trying to put a non-flex player in a flex position!';
  }
  return 'Trying to put a player in an incorrect position!';
};

// Is a player on the entry's roster
export const isPlayerOnRoster = function isPlayerOnRoster(entry, playerID: number): string {
  let res = '';
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
export const isOpenRoster = function isOpenRoster(theentry, playerType: number) {
  for (let i = 0; i < rpos.length; i++) {
    if (theentry[rpos[i]] === null && !(isInvalidSpot(playerType, rpos[i]))) {
      return rpos[i];
    }
  }
  return false;
};

// Transaction object to cause SELECT ... FOR UPDATE
export const tobj = function tobj(t: Transaction) {
  return {
    transaction: t,
    lock: t.LOCK.UPDATE,
  };
};

export interface UError extends Error {
  status: number,
}

// Custom error function that returns a msg and http status
export const uError = function uError(msg: string, status = 500) {
  const err = new Error(msg);
  const uerr: UError = { ...err, status };
  throw uerr;
};

// Console.log passthrough for promises
export const cl = function cl(input: any) {
  // eslint-disable-next-line no-console
  logger.info(input);
  return input;
};

// Validate an object based on a Joi schema
export const validate = function validate(input: Record<string, any>, schema: Schema) {
  const { value, error } = schema.validate(input);
  if (error) { uError(error.details[0].message, 400); }
  return value;
};

// Functions used in Jest testing
// Ensures that a service call returns an object with specific properties
export const ObjectTest = function ObjectTest(
  service: ServiceType, req: any, contains: any,
) {
  return async () => service(req).then((resp: any) => {
    expect(resp).toEqual(expect.objectContaining(contains));
  });
};

// Ensures that a service call returns an array with specific elements
export const ArrayTest = function ArrayTest(service: ServiceType, req: any, items: any[]) {
  return async () => service(req).then((resp: any) => {
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
export const ErrorTest = function ErrorTest(
  service: ServiceType, req: any, statusNumber: number, message: string,
) {
  return async function errortest() {
    try {
      const o = await service(req);
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err: any) {
      if (!err.status) { console.log(err); }
      const uerr: UError = err;
      // eslint-disable-next-line no-console
      expect(uerr.message).toEqual(message);
      expect(uerr.status).toEqual(statusNumber);
    }
  };
};

// Compare strings in constant time
// https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
export const OnCompare = function OnCompare(a: string, b: string) {
  let mismatch = 0;
  for (let i = 0; i < a.length; ++i) {
    // eslint-disable-next-line no-bitwise
    mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return mismatch;
};
// Filter out duplicates
export const onlyUnique = function onlyUnique(value: any, index: number, self: any[]) {
  return self.indexOf(value) === index;
};
