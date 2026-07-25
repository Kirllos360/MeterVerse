# MeterVerse — Quickstart

## Prerequisites
- Node.js 22+, Docker, PostgreSQL 16

## Setup (5 min)
```bash
# 1. Start database
docker compose up -d

# 2. Install backend
cd backend && npm ci && npx prisma db push && npx prisma generate

# 3. Start backend
PORT=3002 node src/server.js

# 4. Install frontend
cd Frontend && npm ci

# 5. Start frontend (separate terminal)
cd Frontend && npm run dev
```

## Access
- Backend API: http://localhost:3002/api/health
- Frontend admin: http://localhost:7400/admin
- API Docs: http://localhost:3002/api-docs

## Testing
```bash
cd backend
npm test              # 113 tests
npm run test:coverage # with coverage
```

## Key Architecture
- Express.js backend with Prisma ORM
- Next.js 16 frontend with Shadcn UI
- PostgreSQL 16 database (86 tables)
- JWT auth with RBAC (7 roles)
