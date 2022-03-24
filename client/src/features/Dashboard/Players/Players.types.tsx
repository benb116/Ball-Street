export type NFLPosType = 1 | 2 | 3 | 4 | 5 | 6 | 99;
export interface PlayerItemType {
  id: number,
  name: string,
  posName?: string,
  NFLTeamId: number,
  NFLPositionId: NFLPosType,
  injuryStatus?: string | null,
  preprice: number,
  postprice: number,
  projPrice: number,
  statPrice: number,
  NFLTeam: {
    gamePhase: string,
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
export type SortByType = keyof PlayerItemType | keyof PriceKeysType | 'teamAbr';
