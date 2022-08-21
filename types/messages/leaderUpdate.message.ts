interface LeaderItemType {
  user: string,
  id: number,
  total: number,
}

interface LeaderUpdateMessage {
  event: 'leaderboard',
  leaderboard: LeaderItemType[],
}

export default LeaderUpdateMessage;
