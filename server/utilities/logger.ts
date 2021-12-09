import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: './logs/error.log', level: 'error' }),
    new transports.File({ filename: './logs/combined.log' }),
  ],
});

logger.add(new transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple(),
  ),
  level: 'verbose',
}));

// @ts-expect-error Ok to add custom shortcut function
logger.verbose = function verb(msg) {
  logger.log('verbose', msg);
};

export default logger;
