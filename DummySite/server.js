const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const WebSocket = require('ws');

// const redis = require('redis');
// const subscriber = redis.createClient();
const account = require("./routes/api/account");
const markets = require("./routes/api/markets");
const offers = require("./routes/api/offers");
const trade = require("./routes/api/trade");
const users = require("./routes/api/users");
const Offer = require("./models/Offer");
const bestPrices = require('./admin/bestPrices.js');
const u = require('./util.js');

const app = express();

// Bodyparser middleware
app.use( bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(() => console.log("MongoDB successfully connected"))
.then(() => Offer.find({filled: false}))
.then((offers) => offers.forEach(u.bestPrices))
.catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/markets", markets);
app.use("/api/account", passport.authenticate('jwt', { session: false }), account);
app.use("/api/offers", passport.authenticate('jwt', { session: false }), offers);
app.use("/api/trade", passport.authenticate('jwt', { session: false }), trade);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));

// subscriber.on('message', (channel, message) => {
//     const msg = {
//         'channel': channel,
//         'data': message
//     };
//     wsBroadcast(msg);
// });
// subscriber.subscribe('priceUpdate');

const wss = new WebSocket.Server({ port: 8080 });

function wsBroadcast(msg) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) { client.send(data); }
    });
}