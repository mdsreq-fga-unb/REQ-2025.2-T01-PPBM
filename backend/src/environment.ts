import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const environment = {
    // Server configuration
    PORT: process.env.PORT || 6140,
    NODE_ENV: process.env.NODE_ENV || 'development',


    // Supabase configuration
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // CORS configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:6140',

    // Whereby API configuration
    WHEREBY_API_KEY: process.env.WHEREBY_API_KEY || '',

} as const;

// Validate required environment variables
export const validateEnvironment = (): void => {
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.warn(`Warning: ${varName} is not set in environment variables`);
        }
    }
};

// Export individual environment variables for convenience
export const {
    PORT,
    NODE_ENV,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    CORS_ORIGIN,
    WHEREBY_API_KEY,
} = environment; 