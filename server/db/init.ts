// Set up the database with proper tables and NFL data

import teams, { teamList } from '../../types/nflinfo';
import {
  EntryActionKindArray,
  EntryActionKinds, ledgerKindArray, ledgerKinds, NFLPosIDs, NFLPosIDType, NFLPosTypes, RosterPosKinds,
} from '../../types/rosterinfo';
import Contest from '../features/contest/contest.model';
import Entry from '../features/entry/entry.model';
import LedgerEntry from '../features/ledger/ledgerEntry.model';
import LedgerKind from '../features/ledger/ledgerKind.model';
import NFLGame from '../features/nflgame/nflgame.model';
import NFLPlayer from '../features/nflplayer/nflplayer.model';
import NFLPosition from '../features/nflposition/nflposition.model';
import NFLTeam from '../features/nflteam/nflteam.model';
import Offer from '../features/offer/offer.model';
import PriceHistory from '../features/pricehistory/pricehistory.model';
import ProtectedMatch from '../features/protectedmatch/protectedmatch.model';
import EntryAction from '../features/trade/entryaction.model';
import EntryActionKind from '../features/trade/entryactionkind.model';
import Trade from '../features/trade/trade.model';
import User from '../features/user/user.model';
import logger from '../utilities/logger';

import scrape from './playerscraper';

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
  // eslint-disable-next-line max-len
  const ledgerkindrecords = ledgerKindArray.map((k) => ({ ...ledgerKinds[k], name: k }));
  await LedgerKind.bulkCreate(ledgerkindrecords);

  // Create kinds of entry actions
  const entryactionkindrecords = EntryActionKindArray.map((k, i) => ({ ...EntryActionKinds[k], name: k, id: i + 1 }));
  await EntryActionKind.bulkCreate(entryactionkindrecords);

  // Create nfl position DB records
  const nflposrecords = NFLPosIDs.map((id) => ({ ...NFLPosTypes[id], id }));
  await NFLPosition.bulkCreate(nflposrecords);

  // Create nfl team DB records
  const teamrecords = teamList.map((t) => {
    const obj = { ...teams[t], abr: t, fullname: `${teams[t].location} ${teams[t].name}` };
    return obj;
  });
  await NFLTeam.bulkCreate(teamrecords);

  // Create nfl team DEF player DB records
  const teamdefrecords = teamList.map((abr) => {
    const fullname = `${teams[abr].location} ${teams[abr].name}`;
    return {
      id: teams[abr].id,
      name: fullname,
      NFLPositionId: RosterPosKinds.DEF.id as NFLPosIDType,
      NFLTeamId: teams[abr].id,
      preprice: 1100,
      postprice: 700,
      active: true,
    };
  });
  await NFLPlayer.bulkCreate(teamdefrecords);

  // Pull NFL players but set constant price values
  await scrape(true);
}

InitDB();
