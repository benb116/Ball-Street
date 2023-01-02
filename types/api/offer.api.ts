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
