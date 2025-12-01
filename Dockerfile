# PPBM Backend Dockerfile for Kubernetes
# Optimized production image without dev dependencies

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY app/apps/backend/package*.json ./
RUN npm install

# Copy TypeScript config and source
COPY app/apps/backend/tsconfig.json ./
COPY app/apps/backend/src/ ./src/

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy package files and install production dependencies only
COPY app/apps/backend/package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 5919

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5919

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5919/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
