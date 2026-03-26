import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = process.env.LOG_DIR ||
  (process.env.NODE_ENV === 'production' ? '/app/logs' : 'C:/logs/nestjs');

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Terminale yaz
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),

    // Günlük dosyaya yaz
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      zippedArchive: true,      // eski logları sıkıştır
      maxSize: '20m',           // max dosya boyutu
      maxFiles: '30d',          // 30 günlük log tut
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format((info) => info.level === 'error' ? false : info)(),
        winston.format.printf(({ timestamp, message }) => {
          return `[${timestamp}] ${message}`;
        }),
      ),
    }),

    // Hata loglarını ayrı dosyaya yaz
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, message }) => {
          return `[${timestamp}] ${message}`;
        }),
      ),
    }),
  ],
};