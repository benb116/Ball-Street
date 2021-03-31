// Websocket server worker
// Subscribe to redis updates and push out to clients

const WebSocket = require('ws');
const redis = require("redis");
const http = require('http');
const express = require('express');
const { promisify } = require("util");

const u = require('../util');
const config = require('../config');
const { hashkey } = require('../db/redisSchema');

const client = redis.createClient();
const hgetallAsync = promisify(client.hgetall).bind(client);

client.subscribe('priceUpdate');
client.subscribe('lastTrade');
client.subscribe('protectedMatch');
client.subscribe('offerFilled');

const priceUpdateMap = {}; // Keep an account of changes, will be flushed on interval
const lastTradeMap = {}; // Keep an account of changes, will be flushed on interval

client.on("message", function (channel, message) {
    switch(channel) {
        case 'priceUpdate':
            const {contestID, nflplayerID, bestbid, bestask} = JSON.parse(message);
            if (!priceUpdateMap[contestID]) { priceUpdateMap[contestID] = {}; }
            priceUpdateMap[contestID][playerID] = {'bid': bestbid, 'ask': bestask};
            break;

        case 'lastTrade':
            const {contestID, nflplayerID, price} = JSON.parse(message);
            if (!priceUpdateMap[contestID]) { priceUpdateMap[contestID] = {}; }
            lastTrade[contestID][playerID] = {'price': price};
            break;

        case 'protectedMatch':
            const {userID, offerID} = JSON.parse(message);
            _ws = connmap(userID);
            _ws.send({ event: 'offerMatched', offerID: offerID });
            break;

        case 'offerFilled':
            const {userID, offerID} = JSON.parse(message);
            _ws = connmap(userID);
            _ws.send({ event: 'offerFilled', offerID: offerID });
            break;
    }
});

const session = require("../middleware/session");
const connmap = new Map();
const contestmap = new Map();
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

    ws.on('message', async function (msg) {
        contestmap.delete(ws);
        // Send starting data
        ws.send(sendLatest(msg.contestID));
        contestmap.set(ws, msg.contestID);
    });

    ws.on('close', function () {
        connmap.delete(userId);
        contestmap.delete(ws);
    });
});

async function sendLatest(contestID) {
    const playerIDs = await ;
    const outPromises = playerIDs.map(p => {
        const rkey = hashkey(contestID, p)
        return hgetallAsync(rkey).then(obj => {
            obj.contestID = contestID;
            obj.nflPlayerID = p;
            return obj;
        })
    });
    return Promise.all(outPromises)
}

// Send out new data when it's available
setInterval(() => {
    if (priceUpdateMap.size) {
        wss.clients.forEach(function each(_ws) {
            if (_ws.readyState === WebSocket.OPEN) {
                const _contestID = contestmap.get(_ws);
                _ws.send(priceUpdateMap[contestID]);
            }
        });
        priceUpdateMap = {};
    }
    if (lastTradeMap.size) {
        wss.clients.forEach(function each(_ws) {
            if (_ws.readyState === WebSocket.OPEN) {
                const _contestID = contestmap.get(_ws);
                _ws.send(lastTradeMap[contestID]);
            }
        });
        lastTradeMap = {};
    }
}, config.RefreshTime*1000);

server.listen(8080, function () {
    console.log('Listening on port 8080');
});