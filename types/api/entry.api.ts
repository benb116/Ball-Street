import { RPosType } from "../rosterinfo";

export interface EntryItemType {
  UserId: number,
  pointtotal: number,
  projTotal?: number,
  rank?: number,
}
export interface EntryType extends EntryItemType {
  ContestId: number,
  createdAt: Date,
  updatedAt: Date,
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

export const preTradeInput = {
  contestID: '1',
  nflplayerID: 123,
  price: undefined,
}
export type PreTradeInputType = typeof preTradeInput

export const reorderInput = {
  contestID: '1',
  pos1: 'RB1' as RPosType,
  pos2: 'RB2' as RPosType,
}
export type ReorderInputType = typeof reorderInput