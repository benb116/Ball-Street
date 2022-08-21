import { client } from '.';

const bestbidHash = (contestID: number) => `contest${contestID}:bestbid`;

async function set(contestID: number, nflplayerID: number, bestbid: number) {
  return client.HSET(bestbidHash(contestID), [nflplayerID.toString(), bestbid.toString()]);
}

async function getall(contestID: number) {
  const out = await client.HGETALL(bestbidHash(contestID));
  const retobj = Object.keys(out).reduce((acc, cur) => {
    acc[Number(cur)] = Number(out[cur]);
    return acc;
  }, {} as Record<number, number>);
  return retobj;
}

const bestbid = { getall, set };
export default bestbid;
