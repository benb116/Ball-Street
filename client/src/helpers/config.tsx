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
export type RosterPosIDType = NFLPosIDType | typeof FlexNFLPositionId;

const RosterPosKinds = {
  FLEX: { id: FlexNFLPositionId, canflex: false },
  QB: { id: 1, canflex: NFLPosTypes[1].canflex },
  RB: { id: 2, canflex: NFLPosTypes[2].canflex },
  WR: { id: 3, canflex: NFLPosTypes[3].canflex },
  TE: { id: 4, canflex: NFLPosTypes[4].canflex },
  K: { id: 5, canflex: NFLPosTypes[5].canflex },
  DEF: { id: 6, canflex: NFLPosTypes[6].canflex },
} as const;

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
