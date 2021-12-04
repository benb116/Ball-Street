interface TeamRecord {
  location: string,
  name: string,
  id: number
}
// Define NFL teams
const teams: Record<string, TeamRecord> = {
  ARI: { location: 'Arizona', name: 'Cardinals', id: 22 },
  ATL: { location: 'Atlanta', name: 'Falcons', id: 1 },
  BAL: { location: 'Baltimore', name: 'Ravens', id: 33 },
  BUF: { location: 'Buffalo', name: 'Bills', id: 2 },
  CAR: { location: 'Carolina', name: 'Panthers', id: 29 },
  CHI: { location: 'Chicago', name: 'Bears', id: 3 },
  CIN: { location: 'Cincinnati', name: 'Bengals', id: 4 },
  CLE: { location: 'Cleveland', name: 'Browns', id: 5 },
  DAL: { location: 'Dallas', name: 'Cowboys', id: 6 },
  DEN: { location: 'Denver', name: 'Broncos', id: 7 },
  DET: { location: 'Detroit', name: 'Lions', id: 8 },
  GB: { location: 'Green Bay', name: 'Packers', id: 9 },
  HOU: { location: 'Houston', name: 'Texans', id: 34 },
  IND: { location: 'Indianapolis', name: 'Colts', id: 11 },
  JAX: { location: 'Jacksonville', name: 'Jaguars', id: 30 },
  KC: { location: 'Kansas City', name: 'Chiefs', id: 12 },
  MIA: { location: 'Miami', name: 'Dolphins', id: 15 },
  MIN: { location: 'Minnesota', name: 'Vikings', id: 16 },
  NE: { location: 'New England', name: 'Patriots', id: 17 },
  NO: { location: 'New Orleans', name: 'Saints', id: 18 },
  NYG: { location: 'New York', name: 'Giants', id: 19 },
  NYJ: { location: 'New York', name: 'Jets', id: 20 },
  LV: { location: 'Las Vegas', name: 'Raiders', id: 13 },
  PHI: { location: 'Philadelphia', name: 'Eagles', id: 21 },
  PIT: { location: 'Pittsburgh', name: 'Steelers', id: 23 },
  LAC: { location: 'Los Angeles', name: 'Chargers', id: 24 },
  SF: { location: 'San Francisco', name: '49ers', id: 25 },
  SEA: { location: 'Seattle', name: 'Seahawks', id: 26 },
  LAR: { location: 'Los Angeles', name: 'Rams', id: 14 },
  TB: { location: 'Tampa Bay', name: 'Buccaneers', id: 27 },
  TEN: { location: 'Tennessee', name: 'Titans', id: 10 },
  WAS: { location: 'Washington', name: 'Football Team', id: 28 },
} as const;

export default teams;
