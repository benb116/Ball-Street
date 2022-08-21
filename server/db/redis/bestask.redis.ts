import { client } from '.';

const bestaskHash = (contestID: number) => `contest${contestID}:bestask`;

async function set(contestID: number, nflplayerID: number, bestask: number) {
  return client.HSET(bestaskHash(contestID), [nflplayerID.toString(), bestask.toString()]);
}

async function getall(contestID: number) {
  const out = await client.HGETALL(bestaskHash(contestID));
  const retobj = Object.keys(out).reduce((acc, cur) => {
    acc[Number(cur)] = Number(out[cur]);
    return acc;
  }, {} as Record<number, number>);
  return retobj;
}

const bestask = { getall, set };
export default bestask;
