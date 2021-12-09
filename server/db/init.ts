// Set up the database with proper tables and NFL data

import { Sequelize } from 'sequelize';
import { RosterPosTypes } from '../config';
import {
  NFLPosition,
  NFLTeam,
  NFLPlayer,
} from '../models';
import teams from '../nflinfo';
import logger from '../utilities/logger';
import scrape from './playerscraper';

async function InitDB(sequelize: Sequelize) {
  logger.info('Initializing the database');
  await sequelize.sync({ force: true });

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
