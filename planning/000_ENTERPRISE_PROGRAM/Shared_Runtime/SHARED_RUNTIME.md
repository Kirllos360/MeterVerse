# Shared Runtime

## Runtime Architecture

All products share a single runtime stack:

| Layer | Technology | Status | Owner |
|-------|-----------|--------|-------|
| HTTP Server | Express.js 4.x | ✅ Live | Backend |
| API Framework | Express Router + Zod validation | ✅ Live | Backend |
| Authentication | JWT (jsonwebtoken) + bcrypt | ✅ Live | auth-engine.js |
| Authorization | requirePermission() + role wildcards | ✅ Live | security.js |
| Rate Limiting | express-rate-limit | ✅ Live | server.js |
| CORS | cors middleware | ✅ Live | server.js |
| Frontend Server | Next.js 16 App Router | ✅ Live | Frontend |
| Real-time (planned) | Socket.IO | ⏳ Wave 02 | T05 WebSocket Gateway |
| Caching (planned) | Redis | ⏳ Wave 04 | T02 Redis Caching |

## Runtime Services

| Service | Status | Used By |
|---------|--------|---------|
| auth-engine.js | ✅ Live | System A + B |
| notification-engine.js | ✅ Live | System A + B |
| email-engine.js | ✅ Live | System A + B |
| sms-engine.js | ✅ Live | System A + B |
| billing-engine.js | ✅ Live | System A + B |
| validation-engine.js | ✅ Live | System A + B |
| alert-engine.js | ✅ Live | System A + B |
| kpi-engine.js | ✅ Live | System A + B |

## Runtime Invariants
1. No product-specific middleware — all middleware is shared
2. No product-specific service — all services are shared
3. Runtime configuration is environment-based, not product-based
4. Health checks cover all shared services
