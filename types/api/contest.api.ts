import { EntryItemType } from "./entry.api";

export interface ContestItemType {
  id: number,
  nflweek: number,
  name: string
  budget: number,
  buyin: number,
}

export interface ContestWithEntryType extends ContestItemType {
  entry: EntryItemType,
}