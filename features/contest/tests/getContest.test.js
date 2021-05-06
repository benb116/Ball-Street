const service = require('../services/getContest.service');

test('gets existing contest', () => {
  const req = {
    user: 1,
    params: {
      contestID: 1,
      leagueID: 1,
    },
    body: {},
  };

  return service(req).then((out) => {
    expect(out).toEqual(expect.objectContaining({
      LeagueId: 1,
      budget: 10000,
      // createdAt: expect.any(Object),
      id: 1,
      name: 'Ball Street Big One',
      nflweek: 1,
      // updatedAt: expect.any(Object),
    }));
  });
});