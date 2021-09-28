const { SumPoints } = require('../nfl/dict.nfl');

describe('NFL worker tests', () => {
  test('Test point calculation', () => {
    const statobjs = [
      { q: '34|23|11|304|0|0|3|14|0|0|0|15', r: '8|11|2|5|0|0|4' },
      { w: '2|23|0|12|0|0|4|1' },
      { x: '2|17|0|0|12' },
      { o: '1|1|0' },
      { k: '0|1|0|1|2|0|0|0|0|0|2|0|4|0|57|178' },
      { f: '14|2|0|1|0|0|0|74|0|20|5|346|0|1|0|1' },
    ];

    const pointvals = [2526, 330, 0, -200, 1900, 500];

    statobjs.forEach((obj, i) => {
      expect(SumPoints(obj)).toBe(pointvals[i]);
    });
  });
});
