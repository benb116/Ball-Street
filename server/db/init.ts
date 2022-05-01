// Set up the database with proper tables and NFL data

import { EntryActionKinds, LedgerKinds, RosterPosTypes } from '../config';
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
import LedgerKind from '../features/ledger/ledgerKind.model';
import LedgerEntry from '../features/ledger/ledgerEntry.model';
import ProtectedMatch from '../features/protectedmatch/protectedmatch.model';
import EntryAction from '../features/trade/entryaction.model';
import EntryActionKind from '../features/trade/entryactionkind.model';

async function InitDB() {
  logger.info('Initializing the database');
  await User.sync({ force: true });
  await Contest.sync({ force: true });
  await LedgerKind.sync({ force: true });
  await LedgerEntry.sync({ force: true });
  await NFLTeam.sync({ force: true });
  await NFLGame.sync({ force: true });
  await NFLPosition.sync({ force: true });
  await NFLPlayer.sync({ force: true });
  await Entry.sync({ force: true });
  await Offer.sync({ force: true });
  await ProtectedMatch.sync({ force: true });
  await PriceHistory.sync({ force: true });
  await Trade.sync({ force: true });
  await EntryActionKind.sync({ force: true });
  await EntryAction.sync({ force: true });

  // Create kinds of ledger entries
  const ledgerkindrecords = Object.keys(LedgerKinds).map((k) => ({ ...LedgerKinds[k], name: k }));
  await LedgerKind.bulkCreate(ledgerkindrecords);

  // Create kinds of entry actions
  const entryactionkindrecords = Object.keys(EntryActionKinds).map((k) => ({ ...EntryActionKinds[k], name: k }));
  await EntryActionKind.bulkCreate(entryactionkindrecords);

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

InitDB();
