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
