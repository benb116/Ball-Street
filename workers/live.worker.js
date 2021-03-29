const WebSocket = require('ws');
const redis = require("redis");
const http = require('http');
const express = require('express');

const u = require('../util');
const config = require('../config');
const client = redis.createClient();

client.subscribe('priceUpdate');
client.subscribe('lastTrade');
client.subscribe('protectedMatch');
client.subscribe('offerFilled');

const priceUpdateMap = new Map();
const lastTradeMap = new Map();

client.on("message", function (channel, message) {
    switch(channel) {
        case 'priceUpdate':
            [playerID, bestbid, bestask] = message.split(' ');
            priceUpdateMap.set(playerID, {'bestbid': bestbid, 'bestask': bestask});
            break;

        case 'lastTrade':
            [playerID, price] = message.split(' ');
            lastTrade.set(playerID, price);
            break;

        case 'protectedMatch':
            [userID, offerID] = message.split(' ');
            _ws = connmap(userID);
            _ws.send({ event: 'offerMatched', offerID: offerID });
            break;

        case 'offerFilled':
            [userID, offerID] = message.split(' ');
            _ws = connmap(userID);
            _ws.send({ event: 'offerFilled', offerID: offerID });
            break;
    }
});

const session = require("../middleware/session");
const connmap = new Map();
const app = express();
app.use(session);

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', function (request, socket, head) {
    console.log('Parsing session from request...');

    session(request, {}, () => {
        if (!request.session.user) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

wss.on('connection', function (ws, request) {
    const userId = request.session.user;

    connmap.set(userId, ws);

    ws.on('close', function () {
        connmap.delete(userId);
    });
});

setInterval(() => {
    if (priceUpdateMap.size) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(priceUpdateMap);
            }
        });
        priceUpdateMap.clear();
    }
    if (lastTradeMap.size) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(lastTradeMap);
            }
        });
        lastTradeMap.clear();
    }
}, config.RefreshTime*1000);

server.listen(8080, function () {
    console.log('Listening on port 8080');
});