export interface ContestItemType {
  id: number,
  nflweek: number,
  name: string
}
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
export type RosterType = Omit<EntryType, 'pointtotal' | 'projTotal' |
'UserId' | 'ContestId' | 'createdAt' | 'updatedAt'>;
export type RosterPosType = keyof RosterType;

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
export interface GameItemType {
  HomeId: number,
  AwayId: number,
  phase: string,
  home: TeamItemType,
  away: TeamItemType,
  startTime: number,
}
export interface TeamMapItemType {
  [key: string]: any,
}

export interface PriceMapItemType {
  nflplayerID: number,
  statPrice?: number,
  projPrice?: number,
  bestbid?: number,
  bestask?: number,
  lastprice?: number,
}

export interface OfferItemType {
  id: string,
  NFLPlayerId: number,
  price: number,
  protected: boolean,
  isbid: boolean,
  expire?: number,
}
export interface OfferObj {
  nflplayerID: number,
  isbid: boolean,
  price: number,
  protected: boolean,
}

export interface LeaderItemType {
  id: number,
  user: number,
  total: number
}

export interface TradeItemType {
  id: string,
  NFLPlayerId: number,
  price: number,
  isbid: boolean,
  createdAt: string,
}
export interface TradeBid {
  price: number,
  bid: {
    NFLPlayerId: number,
    isbid: boolean
    createdAt: string
    id: string,
  },
}
export interface TradeAsk {
  price: number,
  ask: {
    NFLPlayerId: number,
    isbid: boolean
    createdAt: string
    id: string,
  },
}
