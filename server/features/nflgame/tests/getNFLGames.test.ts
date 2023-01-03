import { ArrayTest } from '../../util/util.tests';
import service from '../services/getNFLGames.service';

describe('getNFLGames service', () => {
  test('Valid request returns data', ArrayTest(
    service,
    {},
    [{
      AwayId: 5,
      HomeId: 4,
      away: expect.objectContaining({
        abr: 'CLE', fullname: 'Cleveland Browns', id: 5, location: 'Cleveland', name: 'Browns',
      }),
      home: expect.objectContaining({
        abr: 'CIN', fullname: 'Cincinnati Bengals', id: 4, location: 'Cincinnati', name: 'Bengals',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 7,
      HomeId: 6,
      away: expect.objectContaining({
        abr: 'DEN', fullname: 'Denver Broncos', id: 7, location: 'Denver', name: 'Broncos',
      }),
      home: expect.objectContaining({
        abr: 'DAL', fullname: 'Dallas Cowboys', id: 6, location: 'Dallas', name: 'Cowboys',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 9,
      HomeId: 8,
      away: expect.objectContaining({
        abr: 'GB', fullname: 'Green Bay Packers', id: 9, location: 'Green Bay', name: 'Packers',
      }),
      home: expect.objectContaining({
        abr: 'DET', fullname: 'Detroit Lions', id: 8, location: 'Detroit', name: 'Lions',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 1,
      HomeId: 10,
      away: expect.objectContaining({
        abr: 'ATL', fullname: 'Atlanta Falcons', id: 1, location: 'Atlanta', name: 'Falcons',
      }),
      home: expect.objectContaining({
        abr: 'TEN', fullname: 'Tennessee Titans', id: 10, location: 'Tennessee', name: 'Titans',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 21,
      HomeId: 13,
      away: expect.objectContaining({
        abr: 'PHI', fullname: 'Philadelphia Eagles', id: 21, location: 'Philadelphia', name: 'Eagles',
      }),
      home: expect.objectContaining({
        abr: 'LV', fullname: 'Las Vegas Raiders', id: 13, location: 'Las Vegas', name: 'Raiders',
      }),
      phase: 'mid',
      startTime: 200,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 27,
      HomeId: 14,
      away: expect.objectContaining({
        abr: 'TB', fullname: 'Tampa Bay Buccaneers', id: 27, location: 'Tampa Bay', name: 'Buccaneers',
      }),
      home: expect.objectContaining({
        abr: 'LAR', fullname: 'Los Angeles Rams', id: 14, location: 'Los Angeles', name: 'Rams',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 16,
      HomeId: 15,
      away: expect.objectContaining({
        abr: 'MIN', fullname: 'Minnesota Vikings', id: 16, location: 'Minnesota', name: 'Vikings',
      }),
      home: expect.objectContaining({
        abr: 'MIA', fullname: 'Miami Dolphins', id: 15, location: 'Miami', name: 'Dolphins',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 18,
      HomeId: 17,
      away: expect.objectContaining({
        abr: 'NO', fullname: 'New Orleans Saints', id: 18, location: 'New Orleans', name: 'Saints',
      }),
      home: expect.objectContaining({
        abr: 'NE', fullname: 'New England Patriots', id: 17, location: 'New England', name: 'Patriots',
      }),
      phase: 'pre',
      startTime: 400,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 20,
      HomeId: 19,
      away: expect.objectContaining({
        abr: 'NYJ', fullname: 'New York Jets', id: 20, location: 'New York', name: 'Jets',
      }),
      home: expect.objectContaining({
        abr: 'NYG', fullname: 'New York Giants', id: 19, location: 'New York', name: 'Giants',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 28,
      HomeId: 22,
      away: expect.objectContaining({
        abr: 'WAS', fullname: 'Washington Football Team', id: 28, location: 'Washington', name: 'Football Team',
      }),
      home: expect.objectContaining({
        abr: 'ARI', fullname: 'Arizona Cardinals', id: 22, location: 'Arizona', name: 'Cardinals',
      }),
      phase: 'pre',
      startTime: 400,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 24,
      HomeId: 23,
      away: expect.objectContaining({
        abr: 'LAC', fullname: 'Los Angeles Chargers', id: 24, location: 'Los Angeles', name: 'Chargers',
      }),
      home: expect.objectContaining({
        abr: 'PIT', fullname: 'Pittsburgh Steelers', id: 23, location: 'Pittsburgh', name: 'Steelers',
      }),
      phase: 'mid',
      startTime: 200,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 26,
      HomeId: 25,
      away: expect.objectContaining({
        abr: 'SEA', fullname: 'Seattle Seahawks', id: 26, location: 'Seattle', name: 'Seahawks',
      }),
      home: expect.objectContaining({
        abr: 'SF', fullname: 'San Francisco 49ers', id: 25, location: 'San Francisco', name: '49ers',
      }),
      phase: 'mid',
      startTime: 200,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 3,
      HomeId: 29,
      away: expect.objectContaining({
        abr: 'CHI', fullname: 'Chicago Bears', id: 3, location: 'Chicago', name: 'Bears',
      }),
      home: expect.objectContaining({
        abr: 'CAR', fullname: 'Carolina Panthers', id: 29, location: 'Carolina', name: 'Panthers',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 12,
      HomeId: 30,
      away: expect.objectContaining({
        abr: 'KC', fullname: 'Kansas City Chiefs', id: 12, location: 'Kansas City', name: 'Chiefs',
      }),
      home: expect.objectContaining({
        abr: 'JAX', fullname: 'Jacksonville Jaguars', id: 30, location: 'Jacksonville', name: 'Jaguars',
      }),
      phase: 'pre',
      startTime: 400,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 2,
      HomeId: 33,
      away: expect.objectContaining({
        abr: 'BUF', fullname: 'Buffalo Bills', id: 2, location: 'Buffalo', name: 'Bills',
      }),
      home: expect.objectContaining({
        abr: 'BAL', fullname: 'Baltimore Ravens', id: 33, location: 'Baltimore', name: 'Ravens',
      }),
      phase: 'pre',
      startTime: 400,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      AwayId: 11,
      HomeId: 34,
      away: expect.objectContaining({
        abr: 'IND', fullname: 'Indianapolis Colts', id: 11, location: 'Indianapolis', name: 'Colts',
      }),
      home: expect.objectContaining({
        abr: 'HOU', fullname: 'Houston Texans', id: 34, location: 'Houston', name: 'Texans',
      }),
      phase: 'post',
      startTime: 100,
      week: Number(process.env.WEEK),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }],
  ));
});
