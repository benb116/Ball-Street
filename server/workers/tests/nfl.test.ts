import state from '../nfl/state.nfl';
import { SumPoints } from '../nfl/dict.nfl';
import { CalculateTimefrac, ParseGameFileInit, ParseGameFileUpdate } from '../nfl/games.nfl';

import yahoo from './yahooData';
import setPhase from '../nfl/phase.nfl';
import { FormatInjuryObjects, FindInjuryChanges } from '../nfl/injury.nfl';
import { EstimateProjection } from '../nfl/stats.nfl';
import NFLGame from '../../features/nflgame/nflgame.model';
import Entry from '../../features/entry/entry.model';
import NFLPlayer from '../../features/nflplayer/nflplayer.model';

type TestNameType = keyof typeof yahoo.games;

describe('NFL worker tests', () => {
  describe('Test point calculation', () => {
    const statobjs: Record<string, string>[] = [
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
      test(`${JSON.stringify(obj)} = ${pointvals[i]}`, () => {
        expect(SumPoints(obj)).toBe(pointvals[i]);
      });
    });
  });

  describe('Test time fraction calculation', () => {
    const gamelines = [
      'g|20211216024|12|24|F|26|5|0:00|34|28|1639704000|1|10|15|0|2|2|0|0|1012|0|0|0|1|3|1',
      'g|20211220005|13|5|P|26|2|7:49|7|0|1640037600|1|10|92|5|2|3|5|29|46|0|0|1|1|3|0',
      'g|20211220003|16|3|S|0|1|15:00|0|0|1640049300|1|10|65|0|3|3|0|0|3|0|0|0|0|3|0',
      'g|20211218011|17|11|F|26|4|0:00|17|27|1639876800|3|12|52|0|2|2|0|0|98|0|0|0|1|3|1',
      'g|20211216024|12|24|P|26|5|3:00|34|28|1639704000|1|10|15|0|2|2|0|0|1012|0|0|0|1|3|1', // OT
    ];
    const fracvals = [1, 0.39694444444444443, 0, 1, 0.9571428571428572];

    gamelines.forEach((l, i) => {
      test(l, () => { expect(CalculateTimefrac(l)).toBe(fracvals[i]); });
    });
  });

  describe('Test point projection calculation', () => {
    state.playerTeamMap = {
      100: 3,
      101: 4,
      102: 5,
      103: 4,
      3: 3, // DEF
      4: 4,
      5: 5,
    };
    state.timeObj = {
      3: 0,
      4: 0.3,
      5: 1,
    };
    state.preProjObj = {
      100: 2000,
      101: 1600,
      102: 800,
      103: 850,
      3: 720, // DEF
      4: 520,
      5: 1080,
    };
    const pIDs = [100, 101, 102, 103, 3, 4, 5];
    const statpoints = [0, 0, 1000, 500, 1000, 800, 1200];
    const projvals = [2000, 1120, 1000, 1095, 720, 464, 1200];

    pIDs.forEach((p, i) => {
      test(`${p} projection`, () => { expect(EstimateProjection(p, statpoints[i])).toBe(projvals[i]); });
    });
  });

  describe('Test initial game file parse', () => {
    const testfiles = Object.keys(yahoo.games) as TestNameType[];
    testfiles.forEach((testname) => {
      test(testname, () => {
        yahoo.games[testname].gameobjs = yahoo.games[testname].gameobjs.map((g) => {
          const ng = { ...g };
          ng.week = Number(process.env.WEEK);
          return ng;
        });
        const { phasemap, gameobjs } = ParseGameFileInit(yahoo.games[testname].data);
        expect(phasemap).toStrictEqual(yahoo.games[testname].phasemap);
        expect(gameobjs).toStrictEqual(yahoo.games[testname].gameobjs);
      });
    });
  });

  test('Test phase transition', async () => {
    state.statObj[30175] = { w: '2|23|0|12|0|0|4|1' };
    await setPhase(23, 'post');
    const game = await NFLGame.findOne({ where: { HomeId: 23 } });
    const entry = await Entry.findOne({ where: { ContestId: 2, UserId: 5 } });

    const outphase = game?.toJSON().phase;
    expect(outphase).toBe('post');
    const outentry = entry?.toJSON();
    expect(outentry).toMatchObject({
      WR1: null,
      pointtotal: 830,
    });

    NFLGame.update({ phase: 'mid' }, { where: { HomeId: 23 } });
    Entry.update({ WR1: 30175, pointtotal: 500 }, { where: { ContestId: 2, UserId: 5 } });
  });

  describe('Test game file update parse', () => {
    const testfiles = Object.keys(yahoo.games) as TestNameType[];

    testfiles.forEach((testname) => {
      const postTeams = Object.entries(yahoo.games[testname].phasemap)
        .filter((e) => e[1] === 'post')
        .map((e) => Number(e[0]));
      test(testname, () => {
        state.timeObj = {};
        const [changedTeams, postTeams2] = ParseGameFileUpdate(yahoo.games[testname].data);
        expect(changedTeams).toStrictEqual(yahoo.games[testname].changedTeams);
        expect(postTeams).toEqual(expect.arrayContaining(postTeams2));
        expect(postTeams2).toEqual(expect.arrayContaining(postTeams));
        expect(state.timeObj).toStrictEqual(yahoo.games[testname].timeObj);
      });
    });
  });

  test('Test injury parsing', async () => {
    const injuryObjects = FormatInjuryObjects(yahoo.injury.data);
    FindInjuryChanges(injuryObjects);
    expect(injuryObjects).toEqual(yahoo.injury.injuryobjects); // Better way to evaluate than toEqual?
    const newInjury1 = {
      id: 30996,
      injuryStatus: 'P',
      name: 'injury',
      NFLPositionId: 1,
      NFLTeamId: 1,
      active: false, // If this was a new player record, don't show in results
      preprice: null,
      postprice: null,
    } as NFLPlayer;
    injuryObjects[0] = newInjury1;
    expect(FindInjuryChanges(injuryObjects)).toEqual([newInjury1]);
  });
});
