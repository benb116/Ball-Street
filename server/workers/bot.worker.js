/*
pregame strategy
    Get all players in that position
    Add/subtract random amount from preprice
        max random amount proportional to preprice? Don't pick random nobodies
        preprice + random >= 0
    Sort by adj price / pre price (descending)
    Go down the list and fill entry positions as feasible. If full, skip
midgame strategy
    On stat update
    for each user
        if statupdate player not on roster, return
        Calc new adjprice based on projprice (including how much time is left in game?)
        Submit new offers?

*/

const { getNFLPlayers } = require('../features/nflplayer/nflplayer.service');
const { Roster } = require('../config');
const u = require('../features/util/util');

async function pregame() {
  const allplayers = await getNFLPlayers();
  const adjplayers = allplayers.map((p) => {
    const newp = p;
    newp.adjprice = p.preprice * (1 + Math.random() * (Math.random() > 0.5 ? -1 : 1));
    if (p.adjplayers < 0) {
      newp.adjprice = 0;
    }
    return newp;
  });
  const sortplayers = adjplayers
    .sort((b, a) => (a.adjprice / a.preprice) - (b.adjprice / b.preprice));

  const rpos = Object.keys(Roster);
  const entry = rpos.reduce((acc, cur) => {
    acc[cur] = null;
    return acc;
  }, {});
  let balance = 10000;

  sortplayers.every((p) => {
    const openPosition = u.isOpenRoster(entry, p.NFLPositionId);
    if (openPosition && balance >= p.preprice) {
      entry[openPosition] = p.id;
      balance -= p.preprice;
    }
    return true;
  });

  return entry;
}

pregame();
