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

/**
 * Controller logger interface with endpoint as first argument
 */
export interface ControllerLogger {
    error: (endpoint: string, message: string, meta?: unknown) => void;
    warn: (endpoint: string, message: string, meta?: unknown) => void;
    info: (endpoint: string, message: string, meta?: unknown) => void;
    http: (endpoint: string, message: string, meta?: unknown) => void;
    debug: (endpoint: string, message: string, meta?: unknown) => void;
}

/**
 * Creates a logger prefixed with controller name
 * @param controllerName - The name of the controller (e.g., 'auth', 'alunos')
 * @returns A logger instance with methods that take endpoint as first argument
 * 
 * @example
 * const log = createControllerLogger('auth');
 * log.info('login', 'User logged in', { email: 'user@example.com' });
 * // Output: [auth/login] User logged in { email: 'user@example.com' }
 */
export function createControllerLogger(controllerName: string): ControllerLogger {
    const formatMessage = (endpoint: string, message: string) =>
        `[${controllerName}/${endpoint}] ${message}`;

    return {
        error: (endpoint: string, message: string, meta?: unknown) => {
            logger.error(formatMessage(endpoint, message), meta);
        },
        warn: (endpoint: string, message: string, meta?: unknown) => {
            logger.warn(formatMessage(endpoint, message), meta);
        },
        info: (endpoint: string, message: string, meta?: unknown) => {
            logger.info(formatMessage(endpoint, message), meta);
        },
        http: (endpoint: string, message: string, meta?: unknown) => {
            logger.http(formatMessage(endpoint, message), meta);
        },
        debug: (endpoint: string, message: string, meta?: unknown) => {
            logger.debug(formatMessage(endpoint, message), meta);
        },
    };
}

export default logger; 