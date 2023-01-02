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
export type RosterPosIDType = NFLPosIDType | typeof FlexNFLPositionId
export const RosterPosIDs = (NFLPosIDs as RosterPosIDType[]).concat([FlexNFLPositionId])

export const RosterPosKinds = {
  FLEX: { id: FlexNFLPositionId, canflex: false },
  QB: { id: 1, canflex: NFLPosTypes[1].canflex },
  RB: { id: 2, canflex: NFLPosTypes[2].canflex },
  WR: { id: 3, canflex: NFLPosTypes[3].canflex },
  TE: { id: 4, canflex: NFLPosTypes[4].canflex },
  K: { id: 5, canflex: NFLPosTypes[5].canflex },
  DEF: { id: 6, canflex: NFLPosTypes[6].canflex },
} as const;
export type RosterPosKindType = keyof typeof RosterPosKinds;
export const RosterPosKindList = Object.keys(RosterPosKinds) as RosterPosKindType[];
// Define all roster positions
export const Roster = {
  QB1: RosterPosKinds.QB.id as RosterPosIDType,
  RB1: RosterPosKinds.RB.id as RosterPosIDType,
  RB2: RosterPosKinds.RB.id as RosterPosIDType,
  WR1: RosterPosKinds.WR.id as RosterPosIDType,
  WR2: RosterPosKinds.WR.id as RosterPosIDType,
  TE1: RosterPosKinds.TE.id as RosterPosIDType,
  FLEX1: FlexNFLPositionId as RosterPosIDType,
  FLEX2: FlexNFLPositionId as RosterPosIDType,
  K1: RosterPosKinds.K.id as RosterPosIDType,
  DEF1: RosterPosKinds.DEF.id as RosterPosIDType,
} as const;
export type RPosType = keyof typeof Roster;
export const RosterPositions = Object.keys(Roster) as RPosType[];
type ValueOf<T> = T[keyof T];
export type RosterPosNumType = ValueOf<typeof Roster>;

export const gamePhases = ['pre', 'mid', 'post'] as const;
export type GamePhaseType = typeof gamePhases[number];

interface LedgerKindInfo {
  id: number,
  isCredit: boolean,
}
export const ledgerKinds = {
  Deposit: { id: 1, isCredit: true } as LedgerKindInfo,
  Withdrawal: { id: 2, isCredit: false } as LedgerKindInfo,
  'Entry Fee': { id: 3, isCredit: false } as LedgerKindInfo,
  'Entry Prize': { id: 4, isCredit: true } as LedgerKindInfo,
  'Profit Fee': { id: 5, isCredit: false } as LedgerKindInfo,
  'Miscellaneous Credit': { id: 6, isCredit: true } as LedgerKindInfo,
  'Miscellaneous Debit': { id: 7, isCredit: false } as LedgerKindInfo,
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
