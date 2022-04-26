import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import session from '../middleware/session';
import logger from '../utilities/logger';

import userRoute from '../features/user/user.route';
import apiRoute from './api/routes.api';

const isProduction = process.env.NODE_ENV === 'production';
logger.info(`NODE_ENV = ${process.env.NODE_ENV}, isProduction = ${isProduction}`);
const app = express();

app.use(cors());
app.use(express.json());
app.use(session);
app.use(helmet());
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

// React proxy appends /app to the domain
const routePrefix = (isProduction ? '' : '/app');
app.use(`${routePrefix}/auth/`, userRoute);
app.use(`${routePrefix}/api/`, apiRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { logger.info(`Listening on port ${PORT}`); });
