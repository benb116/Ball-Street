import { client } from '.';

const lasttradeHash = (contestID: number) => `contest${contestID}:lasttrade`;

async function set(contestID: number, nflplayerID: number, lasttrade: number) {
  return client.HSET(lasttradeHash(contestID), [nflplayerID.toString(), lasttrade.toString()]);
}

async function getall(contestID: number) {
  const out = await client.HGETALL(lasttradeHash(contestID));
  const retobj = Object.keys(out).reduce((acc, cur) => {
    acc[Number(cur)] = Number(out[cur]);
    return acc;
  }, {} as Record<number, number>);
  return retobj;
}

const lasttrade = { getall, set };
export default lasttrade;
