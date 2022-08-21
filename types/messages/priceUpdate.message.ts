interface PriceCPItem {
  nflplayerID: number,
  bestbid?: number,
  bestask?: number,
  lastprice?: number,
}
interface PriceCItem {
  [key: number]: PriceCPItem,
}
interface PriceUpdateMessage {
  event: 'priceUpdate',
  pricedata: PriceCItem,
}

export default PriceUpdateMessage;
