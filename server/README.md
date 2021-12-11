# Ball Street Server

## Server Workers

The following separate processes make up the Ball Street backend:

**Main API (qty: scaled) - [workers/api.worker.ts](workers/api.worker.ts)**
Handles client HTTP requests and CRUDs data in the database, redis, or an offer queue. Stateless and can be scaled and load balanced as necessary.

**Live server (qty: scaled) - [workers/live.worker.ts](workers/live.worker.ts)**
Maintains websocket connections, listens for server-side events and transmits live data to users. Should be scaled and load balanced with socket connections distributed among workers.

**Offer worker (qty: 1) - [workers/offer.worker.ts](workers/offer.worker.ts)**
Maintains an order book in memory for each player in each contest and matches offers. Data is durably stored in the database in case worker goes down. **To do**: Allow for multiple offer workers that each handle a separate subset of players and contests.

**Leader worker (qty: 1) - [workers/leader.worker.ts](workers/leader.worker.ts)**
Calculates updating leaderboards for all contests and sends data to websockets.

**NFL worker (qty: 1) - [workers/stats.worker.ts](workers/nfl.worker.js)**
Monitors NFL apis for stats, player, and game updates. Initializes player and game information in the database, then checks for stat changes and game updates. Publishes info for dissemination.

## Get started in development

1. Clone the repository
2. Rename `example.env` to `.env` and modify its values
3. Start the docker containers by running `docker-compose -f docker-compose.yml -f development.yml up -d`
4. Enter the `server` folder
5. Install dependencies (`npm install`)
6. Run `tsc -w` to compile the Typescript code and watch for new changes
