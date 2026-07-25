# Security Audit Report (T112)

## Performed: 2026-07-25

### Authentication
- JWT with 24h expiry, bcrypt password hashing (10 rounds)
- Dev bypass: X-Dev-Mode header gated behind NODE_ENV !== "production"
- Account lockout: 5 failed attempts = 15 min lockout

### Authorization
- 7 roles: super_admin, admin, area_manager, operator, billing, team_leader, viewer
- Role-permission map in middleware/security.js
- requirePermission() on ALL mutation routes

### Data Protection
- Helmet.js security headers (CSP, HSTS, X-Frame-Options)
- CORS restricted to single origin
- Rate limiting: 2000/min global, 20/15min auth

### Audit
- Every mutation logged: auditLog() with correlationId, before/after snapshots
- 279 routes audited across 34 files

### Recommendations
1. Rotate Cloudflare AI token in .env
2. Remove JWT_SECRET fallback "dev-secret-key" from auth.js
3. Set NODE_ENV=production in production
