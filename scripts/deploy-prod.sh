#!/bin/bash
# Production Deployment Script (T117) â€” Hardened for security
set -e

echo "=== MeterVerse Production Deploy ==="

# 0. Validate environment
echo "[0/6] Validating environment..."
if [ -z "$NODE_ENV" ]; then
  echo "ERROR: NODE_ENV must be set to 'production'"
  exit 1
fi
if [ -z "$JWT_SECRET" ]; then
  echo "Generating 64-char random JWT_SECRET..."
  export JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9!@#$%^&*()-_=+' | head -c 64)
  echo "JWT_SECRET generated (save this for future restarts)"
fi
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL must be set"
  exit 1
fi
if [ -z "$CORS_ORIGIN" ]; then
  echo "ERROR: CORS_ORIGIN must be set (e.g., https://app.meterverse.com)"
  exit 1
fi

# 1. Database migration (using migrate deploy for rollback capability)
echo "[1/6] Running database migrations..."
cd backend
npx prisma migrate deploy
npx prisma generate

# 2. Build backend
echo "[2/6] Backend ready (no build needed)"

# 3. Build frontend
echo "[3/6] Building frontend..."
cd ../Frontend
npm ci
npm run build

# 4. Start services
echo "[4/6] Starting services..."
cd ../backend
NODE_ENV=production PORT=3131 DATABASE_URL="$DATABASE_URL" \
  JWT_SECRET="$JWT_SECRET" CORS_ORIGIN="$CORS_ORIGIN" \
  node src/server.js &

# 5. Readiness check (waits up to 30s)
echo "[5/6] Waiting for readiness..."
for i in $(seq 1 30); do
  sleep 1
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3131/api/health/ready 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "Service is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Service failed to become ready"
    exit 1
  fi
done

# 6. Full health check suite
echo "[6/6] Running health check suite..."
curl -f http://localhost:3131/api/health || exit 1
curl -f http://localhost:3131/api/health/ready || exit 1
echo "=== Deploy complete ==="
