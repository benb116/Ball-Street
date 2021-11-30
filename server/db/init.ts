// Set up the database with proper tables and NFL data

import config from '../config';
import {
  NFLPosition,
  NFLTeam,
  NFLPlayer,
} from '../models';
import logger from '../utilities/logger';
import scrape from './playerscraper';

async function InitDB(sequelize) {
  logger.info('Initializing the database');
  await sequelize.sync({ force: true });

  // Define NFL positions
  const nflpos = {
    FLEX: { id: config.FlexNFLPositionId, canflex: false },
    QB: { id: 1, canflex: false },
    RB: { id: 2, canflex: true },
    WR: { id: 3, canflex: true },
    TE: { id: 4, canflex: true },
    K: { id: 5, canflex: false },
    DEF: { id: 6, canflex: false },
  };
  const nflposrecords = Object.keys(nflpos).map((p) => ({ ...nflpos[p], name: p }));
  await NFLPosition.bulkCreate(nflposrecords);
  // NFLPosition.findAll().then(console.log);

  // Define NFL teams
  const teams = {
    ARI: {
      location: 'Arizona', name: 'Cardinals', id: 22, gamePhase: 'pre', fullname: 'Arizona Cardinals',
    },
    ATL: {
      location: 'Atlanta', name: 'Falcons', id: 1, gamePhase: 'pre', fullname: 'Atlanta Falcons',
    },
    BAL: {
      location: 'Baltimore', name: 'Ravens', id: 33, gamePhase: 'pre', fullname: 'Baltimore Ravens',
    },
    BUF: {
      location: 'Buffalo', name: 'Bills', id: 2, gamePhase: 'mid', fullname: 'Buffalo Bills',
    },
    CAR: {
      location: 'Carolina', name: 'Panthers', id: 29, gamePhase: 'pre', fullname: 'Carolina Panthers',
    },
    CHI: {
      location: 'Chicago', name: 'Bears', id: 3, gamePhase: 'pre', fullname: 'Chicago Bears',
    },
    CIN: {
      location: 'Cincinnati', name: 'Bengals', id: 4, gamePhase: 'pre', fullname: 'Cincinnati Bengals',
    },
    CLE: {
      location: 'Cleveland', name: 'Browns', id: 5, gamePhase: 'pre', fullname: 'Cleveland Browns',
    },
    DAL: {
      location: 'Dallas', name: 'Cowboys', id: 6, gamePhase: 'pre', fullname: 'Dallas Cowboys',
    },
    DEN: {
      location: 'Denver', name: 'Broncos', id: 7, gamePhase: 'pre', fullname: 'Denver Broncos',
    },
    DET: {
      location: 'Detroit', name: 'Lions', id: 8, gamePhase: 'pre', fullname: 'Detroit Lions',
    },
    GB: {
      location: 'Green Bay', name: 'Packers', id: 9, gamePhase: 'pre', fullname: 'Green Bay Packers',
    },
    HOU: {
      location: 'Houston', name: 'Texans', id: 34, gamePhase: 'pre', fullname: 'Houston Texans',
    },
    IND: {
      location: 'Indianapolis', name: 'Colts', id: 11, gamePhase: 'pre', fullname: 'Indianapolis Colts',
    },
    JAX: {
      location: 'Jacksonville', name: 'Jaguars', id: 30, gamePhase: 'pre', fullname: 'Jacksonville Jaguars',
    },
    KC: {
      location: 'Kansas City', name: 'Chiefs', id: 12, gamePhase: 'mid', fullname: 'Kansas City Chiefs',
    },
    MIA: {
      location: 'Miami', name: 'Dolphins', id: 15, gamePhase: 'pre', fullname: 'Miami Dolphins',
    },
    MIN: {
      location: 'Minnesota', name: 'Vikings', id: 16, gamePhase: 'pre', fullname: 'Minnesota Vikings',
    },
    NE: {
      location: 'New England', name: 'Patriots', id: 17, gamePhase: 'pre', fullname: 'New England Patriots',
    },
    NO: {
      location: 'New Orleans', name: 'Saints', id: 18, gamePhase: 'pre', fullname: 'New Orleans Saints',
    },
    NYG: {
      location: 'New York', name: 'Giants', id: 19, gamePhase: 'pre', fullname: 'New York Giants',
    },
    NYJ: {
      location: 'New York', name: 'Jets', id: 20, gamePhase: 'pre', fullname: 'New York Jets',
    },
    LV: {
      location: 'Las Vegas', name: 'Raiders', id: 13, gamePhase: 'pre', fullname: 'Las Vegas Raiders',
    },
    PHI: {
      location: 'Philadelphia', name: 'Eagles', id: 21, gamePhase: 'mid', fullname: 'Philadelphia Eagles',
    },
    PIT: {
      location: 'Pittsburgh', name: 'Steelers', id: 23, gamePhase: 'pre', fullname: 'Pittsburgh Steelers',
    },
    LAC: {
      location: 'Los Angeles', name: 'Chargers', id: 24, gamePhase: 'mid', fullname: 'Los Angeles Chargers',
    },
    SF: {
      location: 'San Francisco', name: '49ers', id: 25, gamePhase: 'pre', fullname: 'San Francisco 49ers',
    },
    SEA: {
      location: 'Seattle', name: 'Seahawks', id: 26, gamePhase: 'mid', fullname: 'Seattle Seahawks',
    },
    LAR: {
      location: 'Los Angeles', name: 'Rams', id: 14, gamePhase: 'pre', fullname: 'Los Angeles Rams',
    },
    TB: {
      location: 'Tampa Bay', name: 'Buccaneers', id: 27, gamePhase: 'pre', fullname: 'Tampa Bay Buccaneers',
    },
    TEN: {
      location: 'Tennessee', name: 'Titans', id: 10, gamePhase: 'pre', fullname: 'Tennessee Titans',
    },
    WAS: {
      location: 'Washington', name: 'Football Team', id: 28, gamePhase: 'pre', fullname: 'Washington Football Team',
    },
  };
  const teamfullnamearr = Object.values(teams).map((e) => e.fullname);
  const teamabrs = Object.keys(teams);
  const teamfullnameMap = teamfullnamearr.reduce((acc, cur, i) => {
    acc[cur] = teamabrs[i];
    return acc;
  }, {});
  const teamrecords = Object.keys(teams).map((t) => {
    const obj = { ...teams[t], abr: t };
    delete obj.fullname;
    return obj;
  });
  await NFLTeam.bulkCreate(teamrecords);

  const teamdefrecords = teamfullnamearr.map((t) => {
    const abr = teamfullnameMap[t];
    return {
      id: teams[abr].id,
      name: t,
      NFLPositionId: nflpos.DEF.id,
      NFLTeamId: teams[abr].id,
      preprice: 1100,
      postprice: 700,
    };
  });
  await NFLPlayer.bulkCreate(teamdefrecords);

  // Pull NFL players but set constant price values
  await scrape(true);
}

export default InitDB;
