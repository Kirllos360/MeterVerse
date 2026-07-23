# Risk Register

**Purpose:** All identified risks with mitigation plans.

| ID | Risk | Category | Probability | Impact | Mitigation | Owner |
|----|------|----------|------------|--------|-----------|-------|
| R01 | Email delivery failure | Operational | Medium | High | Retry queue, fallback to in-app | Engineering |
| R02 | Database connection pool exhaustion | Performance | Low | Critical | PgBouncer (Wave 04), connection limiting | Engineering |
| R03 | Permission key gaps | Security | Medium | High | Automated permission audit in CI | Architecture |
| R04 | Schema drift between ORM and DB | Technical | Low | High | Migration chain, prisma validate in CI | Engineering |
| R05 | Browser compatibility | UX | Medium | Medium | Playwright cross-browser tests | Frontend |
| R06 | Third-party API deprecation (SMS/Email) | Operational | Low | High | Adapter pattern, multiple providers | Engineering |
| R07 | Data loss during migration | Operational | Low | Critical | Rollback plan, backup before migration | DevOps |
| R08 | AI model accuracy degradation | AI | Medium | Medium | Continuous monitoring, fallback to rules | AI/ML |
