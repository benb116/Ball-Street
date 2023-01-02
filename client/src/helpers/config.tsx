export const Roster = {
  QB1: null,
  RB1: null,
  RB2: null,
  WR1: null,
  WR2: null,
  TE1: null,
  FLEX1: null,
  FLEX2: null,
  K1: null,
  DEF1: null,
} as const;
export type RosterPosType = keyof typeof Roster;
export const RosterPositions = Object.keys(Roster) as RosterPosType[];

export const flexPosID = 99;
export const rosterkey = {
  QB1: 1,
  RB1: 2,
  RB2: 2,
  WR1: 3,
  WR2: 3,
  TE1: 4,
  FLEX1: flexPosID,
  FLEX2: flexPosID,
  K1: 5,
  DEF1: 6,
} as const;

export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
  99: { name: 'FLEX', canflex: true },
} as const;
