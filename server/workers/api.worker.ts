import express from 'express';
import cors from 'cors';

import session from '../middleware/session';
import limiter from '../middleware/limiter';
import logger from '../utilities/logger';

import userRoute from '../features/user/user.route';
import apiRoute from './api/routes.api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet');

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
app.use(`${routePrefix}/auth/`, userRoute);
app.use(`${routePrefix}/api/`, apiRoute);

const server = app.listen(process.env.PORT || 5000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});