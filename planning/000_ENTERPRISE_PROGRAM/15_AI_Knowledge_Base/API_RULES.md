# API Rules

1. Every endpoint returns JSON
2. Every list endpoint supports pagination (page, limit)
3. Every list endpoint caps limit at 100
4. Every mutation endpoint requires Zod validation
5. Every endpoint requires authentication (except /api/auth/login)
6. Every endpoint requires authorization (requireRole or requirePermission)
7. Every endpoint is audited (auditLog)
8. Error responses are always { error: string }
9. HTTP methods follow REST conventions
10. System type in JWT must match the application calling
