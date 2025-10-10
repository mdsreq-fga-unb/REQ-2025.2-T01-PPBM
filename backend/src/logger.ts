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
    return 'debug';
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Custom format
const format = winston.format.combine(
    // Add timestamp
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    // Add colors
    winston.format.colorize({ all: true }),
    // Format the message
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define which transports the logger must use
const transports = [
    // Console transport
    new winston.transports.Console(),
    // File transport for errors
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    // File transport for all logs
    new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default logger; 