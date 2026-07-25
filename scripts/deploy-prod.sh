#!/bin/bash
# Production Deployment Script (T117)
set -e

echo "=== MeterVerse Production Deploy ==="

# 1. Database migration
echo "[1/5] Running database migrations..."
cd backend
npx prisma db push --accept-data-loss
npx prisma generate

# 2. Build backend
echo "[2/5] Backend ready (no build needed)"

# 3. Build frontend
echo "[3/5] Building frontend..."
cd ../Frontend
npm ci
npm run build

# 4. Start services
echo "[4/5] Starting services..."
cd ../backend
NODE_ENV=production PORT=3001 node src/server.js &

# 5. Health check
echo "[5/5] Running health check..."
sleep 3
curl -f http://localhost:3001/api/health || exit 1
echo "=== Deploy complete ==="
