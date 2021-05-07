const services = {};

services.contest = require('./features/contest/contest.service');
services.entry = require('./features/entry/entry.service');
services.league = require('./features/league/league.service');
services.nflplayer = require('./features/nflplayer/nflplayer.service');
services.offer = require('./features/offer/offer.service');
services.trade = require('./features/trade/trade.service');
services.user = require('./features/user/user.service');

module.exports = services;
