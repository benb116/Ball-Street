# Server workers

The following separate processes make up the Ball Street backend:

## Main API (qty: scaled)
#### Entrypoint: [workers/api.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/api.worker.js)
Handles client HTTP requests and CRUDs data in the database, redis, or an offer queue. Stateless and can be scaled and load balanced as necessary.

## Live server (qty: scaled)
#### Entrypoint: [workers/live.worker.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/live.worker.js)
Maintains websocket connections, listens for server-side events and transmits live data to users. Should be scaled and load balanced with socket connections distributed among workers.

## Offer worker (qty: 1)
#### Entrypoint: [workers/offer.worker.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/offer.worker.js)
Maintains an order book in memory for each player in each contest and matches offers. Data is durably stored in the database in case worker goes down. **To do**: Allow for multiple offer workers that each handle a separate subset of players and contests.

## Leader worker (qty: 1)
#### Entrypoint: [workers/leader.worker.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/leader.worker.js)
Calculates updating leaderboards for all contests.

## Stats worker (qty: 1)
#### Entrypoint: [workers/stats.worker.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/stats.worker.js)
Monitors NFL stat apis and sends out updated stat info for dissemination.

## Phase worker (qty: 1)
#### Entrypoint: [workers/phase.worker.js](https://github.com/benb116/Ball-Street/blob/master/server/workers/phase.worker.js)
Monitors NFL games to adjust player trading options (when can they be added and dropped unilateraly, when can offers be submitted).