// Define NFL positions
export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
} as const;
export type NFLPosIDType = keyof typeof NFLPosTypes;
export const NFLPosIDs = Object.keys(NFLPosTypes).map(Number) as NFLPosIDType[];

// Define Roster position types
export const FlexNFLPositionId = 99;
interface RosterPosType {
  id: NFLPosIDType | typeof FlexNFLPositionId
  canflex: boolean
}
export const RosterPosTypes: Record<string, RosterPosType> = {
  FLEX: { id: FlexNFLPositionId, canflex: false },
  QB: { id: 1, canflex: NFLPosTypes[1].canflex },
  RB: { id: 2, canflex: NFLPosTypes[2].canflex },
  WR: { id: 3, canflex: NFLPosTypes[3].canflex },
  TE: { id: 4, canflex: NFLPosTypes[4].canflex },
  K: { id: 5, canflex: NFLPosTypes[5].canflex },
  DEF: { id: 6, canflex: NFLPosTypes[6].canflex },
};
// Define all roster positions
export const Roster = {
  QB1: 1,
  RB1: 2,
  RB2: 2,
  WR1: 3,
  WR2: 3,
  TE1: 4,
  FLEX1: FlexNFLPositionId,
  FLEX2: FlexNFLPositionId,
  K1: 5,
  DEF1: 6,
} as const;
export type RPosType = keyof typeof Roster;
export const RosterPositions = Object.keys(Roster) as RPosType[];
type ValueOf<T> = T[keyof T];
export type RosterPosNumType = ValueOf<typeof Roster>;

export const gamePhases = ['pre', 'mid', 'post'] as const;
export type GamePhaseType = typeof gamePhases[number];

// Configuration parameters for the site
export const CallbackURL: string = (process.env.CALLBACK_URL || '');
// How long to wait before filling a protected offer
export const ProtectionDelay = (process.env.NODE_ENV === 'production' ? 30 : 5); // seconds
// Are offers protected by default?
export const DefaultProtected = false;
// How often to refresh websocket info
export const RefreshTime = 5; // seconds
// Email verification parameters
export const verificationTimeout = 5; // minutes
export const verificationTokenLength = 128;

interface LedgerKindType {
  id: number,
  isCredit: boolean,
}
export const LedgerKinds: Record<string, LedgerKindType> = {
  Deposit: { id: 1, isCredit: true },
  Withdrawal: { id: 2, isCredit: false },
  'Entry Fee': { id: 3, isCredit: false },
  'Entry Prize': { id: 4, isCredit: true },
  'Miscellaneous Credit': { id: 5, isCredit: true },
  'Miscellaneous Debit': { id: 6, isCredit: false },
};

interface EntryActionKindType {
  id: number,
}
export const EntryActionKinds: Record<string, EntryActionKindType> = {
  Add: { id: 1 },
  Drop: { id: 2 },
  Convert: { id: 3 },
};
