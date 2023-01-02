import { TeamIDType } from "../nflinfo";
import { NFLPosIDType, RosterPosKindType } from "../rosterinfo";

export interface PlayerItemType {
  id: number,
  name: string,
  posName?: RosterPosKindType,
  NFLTeamId: TeamIDType,
  NFLPositionId: NFLPosIDType,
  injuryStatus?: string | null,
  preprice: number | null,
  postprice: number | null, 
  NFLTeam?: {
    gamePhase: PhaseType,
  },
}

interface TeamItemType {
  id: number,
  abr: string,
}
export type PhaseType = 'pre' | 'mid' | 'post';
export interface GameItemType {
  HomeId: number,
  AwayId: number,
  phase: PhaseType,
  home: TeamItemType,
  away: TeamItemType,
  startTime: number,
}
export interface TeamMapType {
  [key: string] :{
    id: number,
    phase: PhaseType,
    abr: string,
  }
}

export interface PriceKeysType {
  statPrice?: number,
  projPrice?: number,
  bestbid?: number,
  bestask?: number,
  lastprice?: number,
}
export interface PriceMapItemType extends PriceKeysType {
  nflplayerID: number,
}
export type SortByType = keyof PriceKeysType | 'name' | 'posName' | 'teamAbr';
