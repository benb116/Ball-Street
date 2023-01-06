export interface OfferItemType {
  id: string,
  NFLPlayerId: number,
  price: number,
  protected: boolean,
  isbid: boolean,
  expire?: number,
}
export const createOfferInput = {
  nflplayerID: 12345,
  isbid: false,
  price: 1000,
  protected: true,
}
export type CreateOfferInputType = typeof createOfferInput

export const cancelOfferInput = {
  offerID: 'fhjdksllsd'
} 
export type CancelOfferInputType  = typeof cancelOfferInput

const contestInput = {
  contestID: '1'
}
export type CreateOfferQueryType = CreateOfferInputType & typeof contestInput
export type CancelOfferQueryType = CancelOfferInputType & typeof contestInput