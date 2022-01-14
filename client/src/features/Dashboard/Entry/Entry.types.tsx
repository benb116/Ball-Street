export interface EntryItemType {
  UserId: number,
  pointtotal: number,
  projTotal?: number,
}
export interface EntryType extends EntryItemType {
  ContestId: number,
  UserId: number,
  pointtotal: number,
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
export type RosterType = Omit<EntryType, 'pointtotal' | 'projTotal' | 'UserId' | 'ContestId' | 'createdAt' | 'updatedAt'>;
export type RosterPosType = keyof RosterType;
