import { Schema } from 'joi';
import { Transaction } from 'sequelize';

import {
  FlexNFLPositionId, NFLPosIDType, NFLPosTypes, Roster, RosterPositions, RPosType,
} from '../../config';

import Entry from '../entry/entry.model';

// Return whether a player type (number) cannot be put into a specific roster position
export const isInvalidSpot = function isInvalidSpot(playerType: NFLPosIDType, rosterPosName: RPosType) {
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
export const isPlayerOnRoster = function isPlayerOnRoster(entry: Entry, playerID: number): RPosType | false {
  for (let i = 0; i < RosterPositions.length; i++) {
    if (entry[RosterPositions[i]] === playerID) {
      return RosterPositions[i];
    }
  }
  return false;
};

// Could a player type be put into a spot on the roster
// Is the spot open AND is the player type valid
export const isOpenRoster = function isOpenRoster(theentry: Entry, playerType: NFLPosIDType) {
  for (let i = 0; i < RosterPositions.length; i++) {
    if (theentry[RosterPositions[i]] === null && !isInvalidSpot(playerType, RosterPositions[i])) {
      return RosterPositions[i];
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
  message: string,
  name: string,
  status: number,
}

// Custom error function that returns a msg and http status
export const uError = function uError(msg: string, status = 500) {
  const uerr: UError = { name: msg, message: msg, status };
  throw uerr;
};

export const isUError = (item: unknown): item is UError => !!(item as UError)?.status;

// Validate an object based on a Joi schema
export const validate = function validate(input: unknown, schema: Schema) {
  const { value, error } = schema.validate(input);
  if (error) { return uError(error.details[0].message, 400); }
  return value;
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
export const onlyUnique = function onlyUnique(value: unknown, index: number, self: unknown[]) {
  return self.indexOf(value) === index;
};
