import { client } from '.';

const statpriceHash = 'stat';

interface PlayerValType {
  nflplayerID: number,
  statPrice: number,
  projPrice: number,
}

async function set(playerVals: PlayerValType[]) {
  if (!playerVals.length) return;
  const statvals = playerVals.reduce((acc, cur) => {
    acc.push(cur.nflplayerID.toString(), cur.statPrice.toString());
    return acc;
  }, [] as string[]);
  client.HSET(statpriceHash, statvals);
}

async function getall() {
  const out = await client.HGETALL(statpriceHash);
  const retobj = Object.keys(out).reduce((acc, cur) => {
    acc[Number(cur)] = Number(out[cur]);
    return acc;
  }, {} as Record<number, number>);
  return retobj;
}

const statprice = { getall, set };
export default statprice;
