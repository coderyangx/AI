import winston from 'winston';
import path from 'node:path';

// console.log('日志路径', process.env.PWD);
const LOGS_DIR = path.join(process.env.PWD || '', 'logs/ai-agent');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { app: 'ai-agent' },
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      dirname: LOGS_DIR,
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'info.log',
      dirname: LOGS_DIR,
      level: 'info',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
