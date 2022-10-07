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
export const RosterPosKinds = {
  FLEX: { id: FlexNFLPositionId, canflex: false } as RosterPosType,
  QB: { id: 1, canflex: NFLPosTypes[1].canflex } as RosterPosType,
  RB: { id: 2, canflex: NFLPosTypes[2].canflex } as RosterPosType,
  WR: { id: 3, canflex: NFLPosTypes[3].canflex } as RosterPosType,
  TE: { id: 4, canflex: NFLPosTypes[4].canflex } as RosterPosType,
  K: { id: 5, canflex: NFLPosTypes[5].canflex } as RosterPosType,
  DEF: { id: 6, canflex: NFLPosTypes[6].canflex } as RosterPosType,
} as const;
export type RosterPosKindType = keyof typeof RosterPosKinds;
export const RosterPosKindList = Object.keys(RosterPosKinds) as RosterPosKindType[];
// Define all roster positions
export const Roster = {
  QB1: RosterPosKinds.QB.id,
  RB1: RosterPosKinds.RB.id,
  RB2: RosterPosKinds.RB.id,
  WR1: RosterPosKinds.WR.id,
  WR2: RosterPosKinds.WR.id,
  TE1: RosterPosKinds.TE.id,
  FLEX1: FlexNFLPositionId,
  FLEX2: FlexNFLPositionId,
  K1: RosterPosKinds.K.id,
  DEF1: RosterPosKinds.DEF.id,
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

interface LedgerKindInfo {
  id: number,
  isCredit: boolean,
}
export const ledgerKinds = {
  Deposit: { id: 1, isCredit: true } as LedgerKindInfo,
  Withdrawal: { id: 2, isCredit: false } as LedgerKindInfo,
  'Entry Fee': { id: 3, isCredit: false } as LedgerKindInfo,
  'Entry Prize': { id: 4, isCredit: true } as LedgerKindInfo,
  'Miscellaneous Credit': { id: 5, isCredit: true } as LedgerKindInfo,
  'Miscellaneous Debit': { id: 6, isCredit: false } as LedgerKindInfo,
} as const;
type LedgerKindType = keyof typeof ledgerKinds;
export const ledgerKindArray = Object.keys(ledgerKinds) as LedgerKindType[];

interface EntryActionKindInfo {
  id: number,
}
export const EntryActionKinds = {
  Add: { id: 1 } as EntryActionKindInfo,
  Drop: { id: 2 } as EntryActionKindInfo,
  Convert: { id: 3 } as EntryActionKindInfo,
} as const;
type EntryActionKindType = keyof typeof EntryActionKinds;
export const EntryActionKindArray = Object.keys(EntryActionKinds) as EntryActionKindType[];
