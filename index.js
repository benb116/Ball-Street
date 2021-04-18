const sequelize = require('./db');
const models = require('./models');
const services = require('./services');
const u = require('./features/util/util');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
console.log('go');
(async () => {
  await require('./db/dbpopulate')(sequelize);

  // services.entry.getEntry({params: {entryID: 2}});
  // services.entry.createEntry({
  //     session: {user: {id: 5}},
  //     params: {
  //         leagueID: 2,
  //         contestID: 2,
  //     }
  // });

  const tradeResults = await services.trade.preTradeAdd({

    session: { user: { id: 5 } },
    params: { contestID: 2 },
    body: {
      // nflplayerID: 19045,
      nflplayerID: 17923,
      rosterposition: 'RB1',
    },
  }).then(u.dv).then(console.log).catch(console.error);

  const tradeResults2 = await services.trade.preTradeAdd({

    session: { user: { id: 9 } },
    params: { contestID: 2 },
    body: {
      // nflplayerID: 19045,
      nflplayerID: 17923,
      rosterposition: 'RB2',
    },
  }).then(u.dv).then(console.log).catch(console.error);

  const tradeResults3 = await services.trade.preTradeAdd({

    session: { user: { id: 5 } },
    params: { contestID: 2 },
    body: {
      nflplayerID: 19045,
      // nflplayerID: 17923,
      rosterposition: 'FLEX1',
    },
  }).then(u.dv).then(console.log).catch(console.error);

  // const tradeResults4 = await services.trade.preTradeAdd({
  //
  // session: {user: {id: 4}},
  //     body: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // const offerObj3 = await services.offer.createOffer({

  //     session: {user: {id: 2}},
  //     body: { offerObj: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         isbid: false,
  //         price: 900,
  //     }}
  // }).then(u.dv).catch(console.error);
  // // await delay(1000);

  // const offerObj = await services.offer.createOffer({

  //     session: {user: {id: 3}},
  //     body: { offerObj: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         isbid: true,
  //         price: 1000,
  //         protected: true,
  //     }}
  // }).then(u.dv).catch(console.error);
  // if (!offerObj) {return;}

  // // await delay(1000);

  // const offerObj4 = await services.offer.createOffer({

  //     session: {user: {id: 1}},
  //     body: { offerObj: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         isbid: false,
  //         price: 950,
  //     }}
  // }).then(u.dv).catch(console.error);
  // // await delay(1000);

  // const offerObj5 = await services.offer.createOffer({

  //     session: {user: {id: 4}},
  //     body: { offerObj: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         isbid: true,
  //         price: 1100,
  //     }}
  // }).then(u.dv).catch(console.error);

  // await delay(8000);

  // await services.offer.cancelOffer({
  //     body: { offerID: offerObj.id }
  // });
  // await delay(7000);

  // const tradeResults7 = await services.trade.preTradeAdd({
  //
  // session: {user: {id: 1}},
  //     body: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // const tradeResults8 = await services.trade.preTradeAdd({
  //
  // session: {user: {id: 2}},
  //     body: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         nflplayerID: 17923,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  await services.nflplayer.getNFLPlayerOfferSummary({
    params: {
      nflplayerID: offerObj.NFLPlayerId,
      contestID: 1,
    },
  }).then((res) => {
    const [bids, asks] = res;
    // console.log(bids);
    const thebids = bids.map((p) => { p.count = Number(p.count); return p; }).sort((a, b) => Number(b.count) - Number(a.count));
    const theasks = asks.map((p) => { p.count = Number(p.count); return p; }).sort((a, b) => Number(b.count) - Number(a.count));
    return [thebids, theasks];
  })
    .then(console.log);

  await services.nflplayer.getNFLPlayerNumAdds({
    params: {
      nflplayerID: offerObj.NFLPlayerId,
      contestID: 1,
    },
  }).then(console.log);

  // const entres1 = await services.entry.getEntry({
  //
  // session: {user: {id: 1}},
  //     params: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // const entres2 = await services.entry.getEntry({
  //
  // session: {user: {id: 2}},
  //     params: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // const entres3 = await services.entry.getEntry({
  //
  // session: {user: {id: 3}},
  //     params: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // const entres4 = await services.entry.getEntry({
  //
  // session: {user: {id: 4}},
  //     params: {
  //         contestID: 1,
  //         // nflplayerID: 19045,
  //         // rosterposition: "RB1"
  //     }
  // }).then(u.dv).then(console.log).catch(console.error);

  // await services.offer.cancelOffer({
  //     params: { offerID: offerObj.id }
  // });
})();
