import winston from 'winston';
import { config } from '../config/config.js';

// Use a dedicated LOG_LEVEL variable, or fall back to a default
const logLevel = process.env.LOG_LEVEL || (config.nodeEnv === 'production' ? 'info' : 'debug');

const logger = winston.createLogger({
  level: logLevel, // Set the log level based on the environment variable
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cyber-news-scraper' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
