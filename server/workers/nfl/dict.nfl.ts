/** Stat categories in the Yahoo file and their letters */
export const yahooStatMap = {
  r: 'rushing',
  w: 'receiving',
  q: 'passing',
  // z: 'defense',
  // n: 'punting',
  x: 'returning',
  k: 'kicking',
  o: 'fumbles',
  f: 'defense',
  // t: 'offense total',
};
export const validStatLetters = Object.keys(yahooStatMap);

/** Dot product coefficients for stats in each category */
export const multiplierTable = {
  q: [0, 0, 0, 0.04, 4, -1],
  r: [0, 0.1, 6],
  w: [0.5, 0.1, 6],
  x: [0, 0, 6, 2],
  o: [0, -2, 6],
  k: [3, 3, 3, 4, 5, 0, 0, 0, 0, 0, 1],
  f: [0, 1, 2, 2, 6, 2, 2, 0, 6, 0, 0, 0, 0, 0, 2, 0],
} as const;
type StatCatType = keyof typeof multiplierTable;

/** Calculate the point total from a player's stats */
export function SumPoints(pstats: Record<StatCatType, string>) {
  const categories = Object.keys(pstats) as StatCatType[];
  const rawpoints = categories.reduce((accPoints, curCat) => {
    let newPoints = accPoints;
    const line = pstats[curCat].split('|');
    const multipliers = (multiplierTable[curCat] || []);
    // eslint-disable-next-line no-param-reassign
    newPoints += line.reduce((accStatPoints: number, val: string, lineIndex: number) => {
      // eslint-disable-next-line no-param-reassign
      accStatPoints += Number(val) * (multipliers[lineIndex] || 0);
      return accStatPoints;
    }, 0);
    // Defense points
    if (curCat === 'f') {
      const pointsAllowed = Number(line[0]);
      if (pointsAllowed === 0) {
        newPoints += 10;
      } else if (pointsAllowed < 7) {
        newPoints += 7;
      } else if (pointsAllowed < 14) {
        newPoints += 4;
      } else if (pointsAllowed < 21) {
        newPoints += 1;
      } else if (pointsAllowed < 28) {
        newPoints += 0;
      } else if (pointsAllowed < 35) {
        newPoints += -1;
      } else {
        newPoints += -4;
      }
    }
    return newPoints;
  }, 0);
  return Math.round(rawpoints * 100);
}
