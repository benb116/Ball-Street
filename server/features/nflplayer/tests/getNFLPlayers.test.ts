import service from '../services/getNFLPlayers.service'

describe('getNFLPlayers service', () => {
  test('Valid request returns data', async () => {
    const out = await service();
    expect(out.length).toBe(513);
    expect(out[0]).toEqual(expect.objectContaining({
      id: 22,
      name: 'Arizona Cardinals',
      jersey: 0,
      preprice: 1100,
      postprice: 700,
      NFLPositionId: 6,
      NFLTeamId: 22,
      active: true,
      injuryStatus: null,
    }));
  });
});
