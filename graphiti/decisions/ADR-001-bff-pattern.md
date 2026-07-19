# ADR-001: BFF (Backend-For-Frontend) Pattern

**Status**: Accepted  
**Date**: 2026-07-19  
**Author**: MeterVerse Architecture Team

## Context

The MeterVerse frontend needs to connect to backend services. Currently no backend server exists. We need a pattern that works with mock data during development but can switch to a real backend without frontend changes.

## Decision

Use the BFF (Backend-For-Frontend) pattern:

1. **API Routes** (`/api/*`) are Next.js route handlers in the frontend project
2. **Service Layer** (`api/service.ts`) calls either:
   - A real backend via `NEXT_PUBLIC_API_URL` environment variable
   - Mock data fallback when no backend is configured
3. **Client calls** (`api-client.ts`) go through the BFF route handlers with Auth headers

## Consequences

- ✅ Frontend never changes when backend is connected
- ✅ Mock data enables full development without backend
- ✅ Security headers and JWT handled by BFF
- ❌ Extra network hop when using BFF proxy
- ❌ Need to keep mock and real implementations in sync
