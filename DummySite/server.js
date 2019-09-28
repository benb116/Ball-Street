const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const accounts = require("./routes/api/accounts");
const markets = require("./routes/api/markets");
const offers = require("./routes/api/offers");
const trade = require("./routes/api/trade");

const app = express();

// Bodyparser middleware
app.use( bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(() => console.log("MongoDB successfully connected"))
.catch(err => console.log(err));
// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/markets", markets);
app.use("/api/accounts", passport.authenticate('jwt', { session: false }), accounts);
app.use("/api/offers", passport.authenticate('jwt', { session: false }), offers);
app.use("/api/trade", passport.authenticate('jwt', { session: false }), trade);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
