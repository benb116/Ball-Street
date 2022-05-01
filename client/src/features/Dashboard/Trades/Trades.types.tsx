export interface TradeTree {
  bids: TradeBidType[],
  asks: TradeAskType[],
  actions: EntryActionType[],
}

interface TradeBidType {
  price: number,
  bid: {
    NFLPlayerId: number,
    isbid: boolean
    createdAt: string
    id: string,
  },
}
interface TradeAskType {
  price: number,
  ask: {
    NFLPlayerId: number,
    isbid: boolean
    createdAt: string
    id: string,
  },
}

interface EntryActionType {
  id: string,
  EntryActionKindId: number,
  UserId: number,
  ContestId: number,
  NFLPlayerId: number,
  price: number,
  EntryActionKind: {
    id: number,
    name: string,
  },
  createdAt: string
}

export interface TradeItemType {
  id: string,
  action: string,
  NFLPlayerId: number,
  price: number,
  createdAt: string,
}
