# MeterVerse Runtime Profile
**Source of Truth** — Version 1.0.0  
**Location:** `enterprise/runtime/runtime-profile.json`

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   METERVERSE ENTERPRISE                    │
├──────────────┬───────────────────────────────────────────┤
│   Frontend    │              Backend                       │
│  Next.js 16   │            NestJS 10                       │
│  shadcn/ui    │            Prisma ORM                      │
│  Radix+Zustand│            PostgreSQL                      │
│  TanStack Q   │            Passport+JWT                    │
├──────────────┴───────────────────────────────────────────┤
│                    Infrastructure                          │
│  Docker 29.5.2 │ WSL 2 │ Redis 8.0.5 │ GitHub Actions     │
├──────────────────────────────────────────────────────────┤
│                    Runtimes                                │
│  Node 24.15 │ Python 3.11.9 │ Go 1.26.5 │ Java 21         │
│  Rust 1.97 │ Bun 1.3.14 │ R 4.6.1                          │
├──────────────────────────────────────────────────────────┤
│                    MCP Layer                               │
│  Notion │ Odoo │ Playwright │ Chrome │ Context7 │ Serena   │
│  CodebaseMemory │ Figma │ Storybook │ Filesystem │ GitLab  │
│  PostgreSQL │ Docker (pending)                              │
└──────────────────────────────────────────────────────────┘
```

## Active Database Schemas (Prisma)
- **Meter/backend/prisma/schema.prisma** — Active backend
- 2 additional schemas exist (duplicate/legacy)

## CI/CD Pipeline
- **Provider:** GitHub Actions (`.github/workflows/ci.yml`)
- **Jobs:** backend (build+test), frontend (build+lint), quality-gate (depcruise+madge+knip), security (audit+trivy+snyk+semgrep+spectral), secret-scan (trufflehog)

## Quality Gates (10 gates)
1. TypeScript compilation
2. ESLint
3. Dependency Cruise
4. Madge circular
5. Playwright tests
6. Security (semgrep/trivy/snyk)
7. npm audit
8. Secrets (trufflehog)
9. API lint (spectral)
10. Performance (lighthouse/axe)
