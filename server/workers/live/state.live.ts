import WebSocket from 'ws';

interface PriceCPItem {
  nflplayerID: number,
  bestbid?: number,
  bestask?: number,
  lastprice?: number,
}
interface PriceCItem {
  [key: string]: PriceCPItem,
}
interface PriceMapType {
  [key: string]: PriceCItem,
}

const out = {
  connmap: new Map<number, WebSocket.WebSocket>(), // Which ws connection corresponds to which user
  contestmap: new Map<WebSocket.WebSocket, number>(), // Which ws connection corresponds to which contest
  priceUpdateMap: {} as PriceMapType, // Keep an account of changes, will be flushed on interval
};

export default out;
