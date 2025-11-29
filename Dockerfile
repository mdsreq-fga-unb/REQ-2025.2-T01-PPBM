# PPBM Backend Dockerfile for Kubernetes
# Optimized production image without dev dependencies

FROM node:20-alpine AS builder

WORKDIR /app


# Install dependencies first (better caching)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy TypeScript config and source
COPY backend/tsconfig.json ./
COPY backend/src/ ./src/

# Install TypeScript for build only
RUN npm install -g typescript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built files and production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

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
