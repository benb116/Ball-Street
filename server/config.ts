// Configuration parameters for the site
export const CallbackURL: string = (process.env.CALLBACK_URL || '');
// How long to wait before filling a protected offer
export const ProtectionDelay = 30; // seconds
// Define NFL positions
interface NFLPosType {
  name: string
  canflex: boolean
}
export const NFLPosTypes: Record<number, NFLPosType> = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
};

// Define Roster position types
interface RosterPosType {
  id: number
  canflex: boolean
}
export const RosterPosTypes: Record<string, RosterPosType> = {
  FLEX: { id: 0, canflex: false },
  QB: { id: 1, canflex: NFLPosTypes[1].canflex },
  RB: { id: 2, canflex: NFLPosTypes[2].canflex },
  WR: { id: 3, canflex: NFLPosTypes[3].canflex },
  TE: { id: 4, canflex: NFLPosTypes[4].canflex },
  K: { id: 5, canflex: NFLPosTypes[5].canflex },
  DEF: { id: 6, canflex: NFLPosTypes[6].canflex },
};
// Define all roster positions
export const Roster: Record<string, number> = {
  QB1: 1,
  RB1: 2,
  RB2: 2,
  WR1: 3,
  WR2: 3,
  TE1: 4,
  FLEX1: 0,
  FLEX2: 0,
  K1: 5,
  DEF1: 6,
};
export const FlexNFLPositionId = 99;
Roster.FLEX1 = FlexNFLPositionId;
Roster.FLEX2 = FlexNFLPositionId;
RosterPosTypes.FLEX.id = FlexNFLPositionId;

export const rposList = Object.keys(Roster);
// Are offers protected by default?
export const DefaultProtected = false;
// How often to refresh websocket info
export const RefreshTime = 5; // seconds
// Email verification parameters
export const verificationTimeout = 5; // minutes
export const verificationTokenLength = 128;
