import pinoHttp from 'pino-http';
import pino from 'pino';

const logger = pino({
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

export const httpLogger = pinoHttp({ logger });
export default logger;
