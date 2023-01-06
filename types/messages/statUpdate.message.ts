export interface PlayerValType {
  nflplayerID: number,
  statPrice: number,
  projPrice: number,
}
interface StatUpdateMessage {
  event: 'statUpdate',
  pricedata: Record<number, PlayerValType>,
}

export default StatUpdateMessage;
