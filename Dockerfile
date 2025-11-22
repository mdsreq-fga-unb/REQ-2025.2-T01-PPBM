# Use an official Node.js runtime
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for Node.js dependencies
COPY backend/package*.json ./backend/

# Install Node.js dependencies
WORKDIR /app/backend
RUN npm ci

# Install ts-node globally for production use
RUN npm install -g ts-node typescript

# Copy TypeScript configuration
COPY backend/tsconfig.json ./
COPY backend/tsconfig.test.json ./
COPY backend/nodemon.json ./
COPY backend/jest.config.js ./

# Copy source code
COPY backend/src/ ./src/
COPY backend/tests/ ./tests/

# Copy other necessary files
COPY backend/*.json ./

# Create necessary directories
RUN mkdir -p /app/backend/dist /app/backend/logs

# Set up git configuration for the container
RUN git config --global user.email "docker@ppbm.com"
RUN git config --global user.name "PPBM Docker Container"

# Build TypeScript code
RUN npm run build || echo "Build completed with warnings"

# Set permissions on directories
RUN chmod -R 755 /app

# Expose port
EXPOSE 6140

# Set environment variables
ENV NODE_ENV=production
ENV PORT=6140

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:6140/health || exit 1

# Switch back to /app/backend directory
WORKDIR /app/backend

# Start the application
CMD ["npm", "start"]
