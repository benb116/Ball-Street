# Ball Street

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c7735630fe984accb61476435d196448)](https://app.codacy.com/gh/benb116/Ball-Street?utm_source=github.com&utm_medium=referral&utm_content=benb116/Ball-Street&utm_campaign=Badge_Grade_Settings)

Ball Street is a live-trading weekly fantasy football game. Build an underrated roster before gametime, then trade players while the games take place. Increase your point total as the week progresses.

## How to play

The goal of the contest is to assemble a roster of players who accrue the most fantasy points. Before the week's games begin, users add players to their rosters. The cost to add a player equals their projected fantasy score for the week. Once a game begins, NFL players in that game can no longer be added or dropped on their own; trades can only happen between different users who submit bid and ask offers. When a game is over, the players' true scores are calculated based on their stats. End with the highest total to win.

## How it works

Ball Street is built using Node.js, React, PostgreSQL and more. Docker is used to containerize the various processes (see [docker-compose](docker-compose.yml)). Client-server communication takes place using REST api calls and websockets.

See [client](client) and [server](server) code

## Tech stack

### Frontend
* React
* React Router
* Redux Toolkit
* NGINX

### Backend
* Node.js
* Typescript
* Express
* Bull queues
* Sequelize
* WS websockets
* Winston
* Redis
* PostgreSQL + TimescaleDB