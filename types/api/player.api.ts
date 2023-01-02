export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
  99: { name: 'FLEX', canflex: true },
} as const;
export type NFLPosType = keyof typeof NFLPosTypes;



export interface PlayerItemType {
  id: number,
  name: string,
  posName?: string,
  NFLTeamId: number,
  NFLPositionId: NFLPosType,
  injuryStatus?: string | null,
  preprice: number | null,
  postprice: number | null, 
  NFLTeam?: {
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
export type SortByType = keyof PriceKeysType | 'name' | 'posName' | 'teamAbr';
