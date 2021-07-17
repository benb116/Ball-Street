# Server workers

The following separate processes make up the Ball Street backend:

## Main API (qty: scaled)
Entrypoint: app.js
Handle HTTP requests from clients and CRUD the database, redis, or a queue

## Live server (qty: scaled)
Entrypoint: workers/live.worker.js
Maintain websocket connections and transmit live data to users

## Offer worker (qty: scaled)
Entrypoint: workers/offer.worker.js
Process offer events on the queue and match offers together

## Leader worker (qty: 1)
Entrypoint: workers/leader.worker.js
Calculate updating leaderboards for all contests

## Stats worker (qty: 1)
Entrypoint: workers/stats.worker.js
Montior NFL stat apis and send out updated stat info

## Phase worker (qty: 1)
Entrypoint: workers/phase.worker.js
Monitor NFL games to adjust player trading options