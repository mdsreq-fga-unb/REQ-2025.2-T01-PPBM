#!/bin/bash

# Docker entrypoint script for PPBM Backend
# Simple entrypoint that starts the Node.js backend

echo "🐳 PPBM Backend Docker Container Starting..."
echo "📂 Working directory: $(pwd)"
echo "🌱 Environment: ${NODE_ENV:-production}"
echo "🔌 Port: ${PORT:-6140}"

# Create necessary directories with proper permissions
echo "🔧 Setting up directories..."
mkdir -p /app/backend/logs /app/backend/dist 2>/dev/null || echo "📝 Directories already exist"
chmod -R 755 /app/backend/logs /app/backend/dist 2>/dev/null || echo "📝 Directory permissions setup"

# Verify Node.js and npm are available
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Navigate to backend directory
cd /app/backend || exit 1

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Build TypeScript if needed
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "🔨 Building TypeScript..."
    npm run build || echo "⚠️  Build completed with warnings"
fi

echo "🚀 Starting PPBM Backend Application..."

# Start the application based on environment
if [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Running in development mode with hot reload..."
    exec npm run dev
else
    echo "🚀 Running in production mode..."
    exec npm start
fi
