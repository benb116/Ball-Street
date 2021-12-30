// Set up the database with proper tables and NFL data

import { RosterPosTypes } from '../config';
import teams from '../nflinfo';
import logger from '../utilities/logger';
import scrape from './playerscraper';

import Contest from '../features/contest/contest.model';
import Entry from '../features/entry/entry.model';
import NFLGame from '../features/nflgame/nflgame.model';
import NFLPlayer from '../features/nflplayer/nflplayer.model';
import NFLPosition from '../features/nflposition/nflposition.model';
import NFLTeam from '../features/nflteam/nflteam.model';
import Offer from '../features/offer/offer.model';
import PriceHistory from '../features/pricehistory/pricehistory.model';
import Trade from '../features/trade/trade.model';
import User from '../features/user/user.model';

async function InitDB() {
  logger.info('Initializing the database');
  await User.sync({ force: true });
  await Contest.sync({ force: true });
  await NFLTeam.sync({ force: true });
  await NFLGame.sync({ force: true });
  await NFLPosition.sync({ force: true });
  await NFLPlayer.sync({ force: true });
  await Entry.sync({ force: true });
  await Offer.sync({ force: true });
  await PriceHistory.sync({ force: true });
  await Trade.sync({ force: true });

  // Create nfl position DB records
  const nflposrecords = Object.keys(RosterPosTypes).map((p) => ({ ...RosterPosTypes[p], name: p }));
  await NFLPosition.bulkCreate(nflposrecords);

  // Create nfl team DB records
  const teamrecords = Object.keys(teams).map((t) => {
    const obj = { ...teams[t], abr: t };
    return obj;
  });
  await NFLTeam.bulkCreate(teamrecords);

  // Create nfl team DEF player DB records
  const teamdefrecords = Object.keys(teams).map((abr) => {
    const fullname = `${teams[abr].location} ${teams[abr].name}`;
    return {
      id: teams[abr].id,
      name: fullname,
      NFLPositionId: RosterPosTypes.DEF.id,
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
