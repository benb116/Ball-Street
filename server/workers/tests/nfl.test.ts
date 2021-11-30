import { SumPoints } from '../nfl/dict.nfl';

describe('NFL worker tests', () => {
  test('Test point calculation', () => {
    const statobjs = [
      { q: '34|23|11|304|0|0|3|14|0|0|0|15', r: '8|11|2|5|0|0|4' },
      { w: '2|23|0|12|0|0|4|1' },
      { x: '2|17|0|0|12' },
      { o: '1|1|0' },
      { k: '0|1|0|1|2|0|0|0|0|0|2|0|4|0|57|178' },
      { f: '14|2|0|1|0|0|0|74|0|20|5|346|0|1|0|1' },
      { f: '17|1|1|0|0|0|1|81|0|4|1|371|1|4|1|1' }, // 2 point after XP
      { f: '13|2|0|1|0|0|0|51|0|14|3|267|0|6|0|1' },
      { f: '34|2|1|0|0|0|0|189|1|15|4|423|0|1|0|1' }, // Return for TD
    ];

    const pointvals = [2526, 330, 0, -200, 1900, 500, 800, 800, 900];

    statobjs.forEach((obj, i) => {
      expect(SumPoints(obj)).toBe(pointvals[i]);
    });
  });
});
