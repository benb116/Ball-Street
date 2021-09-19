const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const session = require('../middleware/session');
const limiter = require('../middleware/limiter');
const logger = require('../utilities/logger');

const isProduction = process.env.NODE_ENV === 'production';
logger.info(`NODE_ENV = ${process.env.NODE_ENV}, isProduction = ${isProduction}`);
const app = express();

app.use(cors());
app.use(express.json());
app.use(session);
app.use(helmet());
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
if (isProduction) {
  app.use(limiter);
}

// React proxy appends /app to the domain
const routePrefix = (isProduction ? '' : '/app');
app.use(`${routePrefix}/auth/`, require('../features/user/user.route'));
app.use(`${routePrefix}/api/`, require('./api/routes.api'));

const server = app.listen(process.env.PORT || 5000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
