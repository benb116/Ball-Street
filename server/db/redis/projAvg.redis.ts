import { client } from '.';

const projAvgHash = (contestID: number) => `contest${contestID}:projAvg`;

async function set(contestID: number, projAvg: number) {
  return client.SET(projAvgHash(contestID), projAvg);
}

async function get(contestID: number | number[]) {
  // eslint-disable-next-line no-param-reassign
  if (typeof contestID === 'number') contestID = [contestID];
  if (!contestID.length) return [];
  const keys = contestID.map(projAvgHash);

  return (await client.MGET(keys)).map(Number);
}

const projAvg = { get, set };
export default projAvg;
