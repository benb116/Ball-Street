// Set up example DB records for use in testing

const models = require('../models');
const logger = require('../utilities/logger');
const InitDB = require('./init');
const { set } = require('./redis');

async function PopulateDB(sequelize) {
  await InitDB(sequelize);
  logger.info('Populating DB with initial data');
  const {
    Contest,
    User,
    Entry,
    League,
    Membership,
    Offer,
    Trade,
    NFLGame,
  } = models;

  // Define Users
  const usrs = ['email1@gmail.com', 'email2@gmail.com', 'email3@gmail.com', 'email4@gmail.com', 'email5@gmail.com'];
  // hash is password1
  await User.bulkCreate(usrs.map((u) => ({
    email: u,
    pwHash: '$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq',
    name: 'bot',
    verified: (u !== 'email5@gmail.com'),
  })));

  const lea = {
    name: 'Ball Street',
    adminId: 1,
    ispublic: true,
  };

  const lea2 = {
    name: 'Ball Street Private',
    adminId: 2,
    ispublic: false,
  };

  const lea3 = {
    name: 'Ball Street Public2',
    adminId: 1,
    ispublic: true,
  };
  await League.bulkCreate([lea, lea2, lea3]);

  // Define memberships
  const pubusrs = usrs.slice(0, 3);
  const mem = pubusrs.map((e, i) => ({
    UserId: i + 1,
    LeagueId: 1,
  }));
  const mem2 = [
    {
      UserId: 1,
      LeagueId: 2,
    },
    {
      UserId: 2,
      LeagueId: 2,
    },
    {
      UserId: 3,
      LeagueId: 2,
    },
    {
      UserId: 1,
      LeagueId: 3,
    },
  ];
  await Membership.bulkCreate(mem);
  await Membership.bulkCreate(mem2);

  // Define existing contest
  const con = {
    name: 'Ball Street Big One',
    LeagueId: 1,
    budget: 10000,
    nflweek: 1,
  };
  const con2 = {
    name: 'Private Contest',
    LeagueId: 2,
    budget: 10000,
    nflweek: 1,
  };
  const con3 = {
    name: 'Public Contest 2',
    LeagueId: 3,
    budget: 10000,
    nflweek: 1,
  };
  await Contest.bulkCreate([con, con2, con3]);

  const entrs = pubusrs.map((e, i) => ({
    UserId: i + 1, ContestId: 1, pointtotal: 10000, RB1: 20933,
  }));
  const entrs2 = [{
    UserId: 1, ContestId: 2, pointtotal: 10000, RB1: 20933, K1: 19041, DEF1: 24,
  }, {
    UserId: 2, ContestId: 2, pointtotal: 1500, RB1: 20933, WR1: 18686, WR2: 18047, K1: 19041,
  }, {
    UserId: 3, ContestId: 2, pointtotal: 500, RB1: 20933, K1: 19041,
  }];
  await Entry.bulkCreate(entrs);
  await Entry.bulkCreate(entrs2);

  const offs = [{
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c2',
    UserId: 1,
    ContestId: 1,
    NFLPlayerId: 20933,
    isbid: false,
    price: 8000,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c3',
    UserId: 2,
    ContestId: 1,
    NFLPlayerId: 20933,
    isbid: false,
    price: 8000,
    cancelled: true,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
    UserId: 3,
    ContestId: 1,
    NFLPlayerId: 20933,
    isbid: false,
    price: 8000,
    filled: true,
  },

  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
    UserId: 1,
    ContestId: 1,
    NFLPlayerId: 20933,
    isbid: true,
    price: 8000,
    filled: true,
  },
  {
    id: '16c94b61-3c76-4078-8fbc-67fac7ed26c5',
    UserId: 2,
    ContestId: 2,
    NFLPlayerId: 20933,
    isbid: false,
    price: 8000,
  }];
  await Offer.bulkCreate(offs);

  const trds = [
    {
      bidId: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
      askId: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
      price: 8000,
    },
  ];
  await Trade.bulkCreate(trds);

  await set.CurrentWeek(1);

  await NFLGame.bulkCreate([
    { week: 1, HomeId: 1, AwayId: 2 },
    {
      week: 1, HomeId: 3, AwayId: 4, phase: 'pre',
    },
    { week: 1, HomeId: 5, AwayId: 6 },
    { week: 1, HomeId: 7, AwayId: 8 },
    { week: 1, HomeId: 9, AwayId: 10 },
    { week: 1, HomeId: 11, AwayId: 12 },
    { week: 1, HomeId: 13, AwayId: 14 },
    {
      week: 1, HomeId: 15, AwayId: 16, phase: 'pre',
    },
    { week: 1, HomeId: 17, AwayId: 18 },
    {
      week: 1, HomeId: 19, AwayId: 20, phase: 'pre',
    },
    { week: 1, HomeId: 21, AwayId: 22 },
    {
      week: 1, HomeId: 23, AwayId: 24, phase: 'mid',
    },
    {
      week: 1, HomeId: 25, AwayId: 26, phase: 'mid',
    },
    {
      week: 1, HomeId: 27, AwayId: 28, phase: 'mid',
    },
    { week: 1, HomeId: 29, AwayId: 30 },
    {
      week: 1, HomeId: 31, AwayId: 32, phase: 'pre',
    },
  ]);
}

module.exports = PopulateDB;
