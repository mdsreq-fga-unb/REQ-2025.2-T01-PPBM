import winston from 'winston';
import { environment } from './environment';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define level based on environment
const level = () => {
    const env = environment.NODE_ENV || 'development';
    return env === 'production' ? 'info' : 'debug';
};

// Define colors for each level (for development)
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Development format - colorized with timestamps
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Production format - JSON for Grafana/Loki ingestion
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
);

// Choose format based on environment
const format = environment.NODE_ENV === 'production' ? prodFormat : devFormat;

// Define transports based on environment
const getTransports = () => {
    const transportList: winston.transport[] = [
        // Console transport (stdout) - always enabled
        new winston.transports.Console(),
    ];

    // File transports only in development (Kubernetes uses stdout → Loki)
    if (environment.NODE_ENV !== 'production') {
        transportList.push(
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
            }),
            new winston.transports.File({ filename: 'logs/all.log' }),
        );
    }

    return transportList;
};

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: getTransports(),
});

export default logger; 