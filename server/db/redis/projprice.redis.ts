import { client } from '.';

const projpriceHash = 'proj';

interface PlayerValType {
  nflplayerID: number,
  statPrice: number,
  projPrice: number,
}

async function set(playerVals: PlayerValType[]) {
  if (!playerVals.length) return;
  const projvals = playerVals.reduce((acc, cur) => {
    acc.push(cur.nflplayerID.toString(), cur.projPrice.toString());
    return acc;
  }, [] as string[]);
  client.HSET(projpriceHash, projvals);
}

async function getall() {
  const out = await client.HGETALL(projpriceHash);
  const retobj = Object.keys(out).reduce((acc, cur) => {
    acc[Number(cur)] = Number(out[cur]);
    return acc;
  }, {} as Record<number, number>);
  return retobj;
}

const projprice = { getall, set };
export default projprice;
