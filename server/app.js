const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const session = require('./middleware/session');
const limiter = require('./middleware/limiter');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../client/build'));
app.use(session);
app.use(helmet());
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
if (isProduction) {
  app.use(limiter);
}

const routePrefix = (isProduction ? '' : '/app');
app.use(`${routePrefix}/auth/`, require('./features/user/user.route'));
app.use(`${routePrefix}/api/`, require('./routes'));

app.get('/*', (req, res) => {
  res.sendFile(`${__dirname}/client/build/index.html`);
});

// finally, let's start our server...
const server = app.listen(process.env.PORT || 5000, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${server.address().port}`);
});
