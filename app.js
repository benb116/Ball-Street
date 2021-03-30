const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const helmet = require("helmet");

const session = require("./middleware/session");
const limiter = require("./middleware/limiter");

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session);
app.use(helmet());
app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(limiter);

app.use('/auth/', require('./routes/auth.route'));
app.use('/api/', require('./routes'));

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + server.address().port);
});