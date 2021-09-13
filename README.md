# Ball Street

Ball Street is a live-trading weekly fantasy football game. Build an underrated roster before gametime, then trade players while the games take place. Increase your point total as the week progresses.

## How to play

Join a contest with other users and create your entry. Before the week's games begin, add any player to your roster using your budget of points. The cost to add a player before their game equals their fantasy projection, so you're incentivized to find undervalued players. Once a game begins, players in that game can no longer be added or dropped on their own; trades happen between different users who submit bid and ask offers. Bid low and ask high to adjust your lineup as the week goes on. When a game is over, the players' point values are calculated based on their stats. End with the highest total to win.

## How it works

Ball Street is built using React+Redux, Node.js, Redis, PostreSQL. Docker is used to containerize the various processes (see [docker-compose](https://github.com/benb116/Ball-Street/blob/master/docker-compose.yml)). Client-server communication takes place using REST api calls and websockets.

See [client](https://github.com/benb116/Ball-Street/blob/master/client) and [server](https://github.com/benb116/Ball-Street/blob/master/server) code

## Tech stack

### Frontend
* React
* React Router
* Redux Toolkit
* NGINX (in production)

### Backend
* Node.js
* Express
* Bull queues
* Sequelize
* WS websockets
* Winston
* Redis
* PostgreSQL