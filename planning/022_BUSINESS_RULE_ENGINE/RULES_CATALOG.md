# Business Rules Engine — Planning

## Currently Hardcoded (Must Become Configurable)

| Rule | Current Location | Configurable | Priority |
|------|:----------------:|:------------:|:--------:|
| Tariff tier calculation | routes/tariffs.js | ✅ Already configurable | P0 |
| Invoice due date (30 days) | routes/billing.js | ❌ Hardcoded | P1 |
| Late fee calculation | routes/billing.js | ❌ Not implemented | P2 |
| Tax rate (14%) | routes/billing.js | ❌ Hardcoded | P1 |
| Account lockout (5 attempts) | auth-engine.js | ❌ Hardcoded | P1 |
| Session timeout | auth-engine.js | ❌ Hardcoded | P1 |
| Password policy | security.js | ❌ Hardcoded | P1 |
| Reading validation thresholds | validation-engine.js | ❌ Hardcoded | P2 |
| High-risk invoice threshold (10k) | routes/billing.js | ❌ Hardcoded | P2 |
| Payment allocation order | routes/payments.js | ❌ Hardcoded | P2 |

## Rule Engine Design
- Rule storage: `SystemConfig` model (key-value with validation schema)
- Rule evaluation: Middleware that reads config at runtime
- Rule UI: Admin configuration panel with form validation
- Rule versioning: Config audit log tracks all changes
- Rule rollback: Previous value stored in audit entry
