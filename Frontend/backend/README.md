# MeterVerse Enterprise API

Enterprise Utility Operating System backend — NestJS + PostgreSQL + Prisma.

## Quick Start

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev --name init

# Seed data
npx ts-node prisma/seed.ts

# Start dev server
npm run start:dev
```

## Architecture

Clean Architecture + DDD:

```
src/
├── core/              # Domain core (entities, value objects, events)
├── modules/           # Feature modules (DDD per module)
│   ├── auth/          # Authentication + RBAC
│   ├── customer/      # Customer management
│   ├── meter/         # Meter lifecycle
│   ├── reading/       # Reading capture + validation
│   ├── invoice/       # Invoice generation + lifecycle
│   └── payment/       # Payment recording
├── infrastructure/    # Cross-cutting (database, logging, cache)
└── main.ts            # Entry point
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | /api/v1/auth/login | Login |
| GET    | /api/v1/customers | List customers |
| GET    | /api/v1/customers/:id | Get customer |
| POST   | /api/v1/customers | Create customer |
| PUT    | /api/v1/customers/:id | Update customer |
| GET    | /api/v1/meters | List meters |
| GET    | /api/v1/meters/:id | Get meter |
| POST   | /api/v1/meters | Create meter |

## Tech Stack

- NestJS 10
- PostgreSQL 16
- Prisma ORM
- JWT Authentication
- CQRS Pattern
- Repository Pattern
- Clean Architecture / DDD
