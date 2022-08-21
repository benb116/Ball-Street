import { client } from '.';

const leaderHash = (contestID: number) => `contest${contestID}:leaderboard`;

interface LeaderItemType {
  user: string,
  id: number,
  total: number,
}

async function set(contestID: number, leaderboard: LeaderItemType[]) {
  return client.SET(leaderHash(contestID), JSON.stringify(leaderboard));
}

async function get(contestID: number) {
  const out = await client.GET(leaderHash(Number(contestID)));
  if (!out) return null;
  return JSON.parse(out) as LeaderItemType[];
}

const leader = { get, set };
export default leader;
