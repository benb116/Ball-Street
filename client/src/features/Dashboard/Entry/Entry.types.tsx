export interface EntryItemType {
  UserId: number,
  pointtotal: number,
  projTotal?: number,
}
export interface EntryType extends EntryItemType {
  ContestId: number,
  createdAt: string,
  updatedAt: string,
  QB1: number | null,
  RB1: number | null,
  RB2: number | null,
  WR1: number | null,
  WR2: number | null,
  TE1: number | null,
  FLEX1: number | null,
  FLEX2: number | null,
  K1: number | null,
  DEF1: number | null,
}

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
