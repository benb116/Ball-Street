// Set up example DB records for use in testing
import logger from '../utilities/logger';

import Contest, { ContestCreateType } from '../features/contest/contest.model';
import Entry from '../features/entry/entry.model';
import NFLGame, { NFLGameCreateType } from '../features/nflgame/nflgame.model';
import Offer, { OfferCreateType } from '../features/offer/offer.model';
import Trade, { TradeCreateType } from '../features/trade/trade.model';
import User, { UserCreateType } from '../features/user/user.model';
import LedgerEntry, { LedgerEntryCreateType } from '../features/ledger/ledgerEntry.model';
import { EntryActionKinds, LedgerKinds } from '../config';
import EntryAction, { EntryActionCreateType } from '../features/trade/entryaction.model';

async function PopulateDB() {
  logger.info('Populating DB with initial data');

  // Define Users
  const usrs = [
    'email1@gmail.com',
    'email2@gmail.com',
    'email3@gmail.com',
    'email4@gmail.com',
    'email5@gmail.com',
    'email6@gmail.com',
  ];
  // hash is password1
  const userRecords: UserCreateType[] = usrs.map((u) => ({
    email: u,
    pwHash: '$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq',
    name: 'bot',
    verified: (u !== 'email5@gmail.com' && u !== 'email6@gmail.com'),
    cash: 1000,
  }));
  userRecords[5].cash = 0;
  await User.bulkCreate(userRecords);

  const ledgerEntries: LedgerEntryCreateType[] = usrs.map((_u, i) => ({
    id: `16c94b61-3c76-4078-8fbc-67fac7ed26d${i}`,
    UserId: i + 1,
    LedgerKindId: LedgerKinds.Deposit.id,
    ContestId: null,
    value: 3000,
  }));
  ledgerEntries[5].value = 1000;
  await LedgerEntry.bulkCreate(ledgerEntries);

  const curweek = Number(process.env.WEEK);
  // Define existing contest
  const con: ContestCreateType = {
    name: 'Ball Street Big One',
    budget: 10000,
    nflweek: curweek,
    buyin: 2000,
  };
  const con2: ContestCreateType = {
    name: 'Private Contest',
    budget: 10000,
    nflweek: curweek,
    buyin: 500,
  };
  const con3: ContestCreateType = {
    name: 'Public Contest 2',
    budget: 10000,
    nflweek: curweek,
    buyin: 500,
  };
  const allcontests = [con, con2, con3];
  await Contest.bulkCreate(allcontests);

  const pubusrs = usrs.slice(0, 3);
  const entrs = pubusrs.map((_e, i) => ({
    UserId: i + 1, ContestId: 1, pointtotal: 10000, RB1: 31885,
  }));
  const entrs2 = [{
    UserId: 1, ContestId: 2, pointtotal: 10000, RB1: 31885, WR1: null, WR2: null, K1: 30266, DEF1: null, TE1: 30213,
  }, {
    UserId: 2, ContestId: 2, pointtotal: 1500, RB1: 31885, WR1: 32398, WR2: 28026, K1: 30266, DEF1: null, TE1: null,
  }, {
    UserId: 3, ContestId: 2, pointtotal: 500, RB1: 31885, WR1: null, WR2: null, K1: 30266, DEF1: null, TE1: 30213,
  }, {
    UserId: 5, ContestId: 2, pointtotal: 500, RB1: 31885, WR1: null, WR2: null, K1: 30266, DEF1: null, TE1: 30213,
  }, {
    UserId: 1, ContestId: 3, pointtotal: 10000, RB1: 31885, WR1: null, WR2: null, K1: 30266, DEF1: 21, TE1: null,
  }, {
    UserId: 2, ContestId: 3, pointtotal: 1500, RB1: 31885, WR1: 32398, WR2: 28026, K1: 30266, DEF1: null, TE1: null,
  }, {
    UserId: 3, ContestId: 3, pointtotal: 500, RB1: 31885, WR1: null, WR2: null, K1: 30266, DEF1: null, TE1: null,
  }];
  await Entry.bulkCreate(entrs);
  await Entry.bulkCreate(entrs2);
  const ledgerEntries2: LedgerEntryCreateType[] = entrs.map((_u, i) => ({
    id: `16c94b61-3c76-4078-8fbc-67fac7ed26b${i}`,
    UserId: _u.UserId,
    LedgerKindId: LedgerKinds['Entry Fee'].id,
    ContestId: _u.ContestId,
    value: allcontests[0].buyin,
  }));
  await LedgerEntry.bulkCreate(ledgerEntries2);
  const ledgerEntries3: LedgerEntryCreateType[] = entrs2.map((_u, i) => ({
    id: `16c94b61-3c76-4078-8fbc-67fac7ed26a${i}`,
    UserId: _u.UserId,
    LedgerKindId: LedgerKinds['Entry Fee'].id,
    ContestId: _u.ContestId,
    value: allcontests[_u.ContestId - 1].buyin,
  }));
  await LedgerEntry.bulkCreate(ledgerEntries3);

  const offs: OfferCreateType[] = [{
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c2',
    UserId: 1,
    ContestId: 1,
    NFLPlayerId: 31885,
    isbid: false,
    price: 8000,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c3',
    UserId: 2,
    ContestId: 1,
    NFLPlayerId: 31885,
    isbid: false,
    price: 8000,
    cancelled: true,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
    UserId: 3,
    ContestId: 1,
    NFLPlayerId: 31885,
    isbid: false,
    price: 8000,
    filled: true,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c7',
    UserId: 3,
    ContestId: 1,
    NFLPlayerId: 31885,
    isbid: true,
    price: 800,
    filled: false,
  },

  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
    UserId: 1,
    ContestId: 1,
    NFLPlayerId: 31885,
    isbid: true,
    price: 8000,
    filled: true,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c5',
    UserId: 2,
    ContestId: 2,
    NFLPlayerId: 31885,
    isbid: false,
    price: 8000,
  }];
  await Offer.bulkCreate(offs);

  const trds: TradeCreateType[] = [
    {
      bidId: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
      askId: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
      price: 8000,
    },
  ];
  await Trade.bulkCreate(trds);

  const acts: EntryActionCreateType[] = [
    {
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26e2',
      EntryActionKindId: EntryActionKinds.Add.id,
      UserId: 1,
      ContestId: 1,
      NFLPlayerId: 31885,
      price: 1100,
    },
  ];
  await EntryAction.bulkCreate(acts);

  const games: NFLGameCreateType[] = [
    {
      week: curweek, HomeId: 10, AwayId: 1, startTime: 100,
    },
    {
      week: curweek, HomeId: 33, AwayId: 2, phase: 'pre', startTime: 400,
    },
    {
      week: curweek, HomeId: 29, AwayId: 3, startTime: 100,
    },
    {
      week: curweek, HomeId: 4, AwayId: 5, startTime: 100,
    },
    {
      week: curweek, HomeId: 6, AwayId: 7, startTime: 100,
    },
    {
      week: curweek, HomeId: 8, AwayId: 9, startTime: 100,
    },
    {
      week: curweek, HomeId: 34, AwayId: 11, startTime: 100,
    },
    {
      week: curweek, HomeId: 30, AwayId: 12, phase: 'pre', startTime: 400,
    },
    {
      week: curweek, HomeId: 15, AwayId: 16, startTime: 100,
    },
    {
      week: curweek, HomeId: 17, AwayId: 18, phase: 'pre', startTime: 400,
    },
    {
      week: curweek, HomeId: 19, AwayId: 20, startTime: 100,
    },
    {
      week: curweek, HomeId: 13, AwayId: 21, phase: 'mid', startTime: 200,
    },
    {
      week: curweek, HomeId: 23, AwayId: 24, phase: 'mid', startTime: 200,
    },
    {
      week: curweek, HomeId: 25, AwayId: 26, phase: 'mid', startTime: 200,
    },
    {
      week: curweek, HomeId: 14, AwayId: 27, startTime: 100,
    },
    {
      week: curweek, HomeId: 22, AwayId: 28, phase: 'pre', startTime: 400,
    },
  ];
  await NFLGame.bulkCreate(games);
}

export default PopulateDB;
