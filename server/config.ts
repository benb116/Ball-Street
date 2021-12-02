export const CallbackURL = process.env.CALLBACK_URL;
export const FlexNFLPositionId = 99;
// How long to wait before filling a protected offer
export const ProtectionDelay = 30; // seconds
// Define NFL positions
export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
};
// Define Roster position types
export const RosterPosTypes = {
  FLEX: { id: 0, canflex: false },
  QB: { id: 1, canflex: false },
  RB: { id: 2, canflex: true },
  WR: { id: 3, canflex: true },
  TE: { id: 4, canflex: true },
  K: { id: 5, canflex: false },
  DEF: { id: 6, canflex: false },
};
// Define all roster positions
export const Roster = {
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
export const rposList = Object.keys(Roster);
// Are offers protected by default?
export const DefaultProtected = false;
// How often to refresh websocket info
export const RefreshTime = 5; // seconds
export const verificationTimeout = 5; // minutes
export const verificationTokenLength = 128;

Roster.FLEX1 = FlexNFLPositionId;
Roster.FLEX1 = FlexNFLPositionId;
RosterPosTypes.FLEX.id = FlexNFLPositionId;
