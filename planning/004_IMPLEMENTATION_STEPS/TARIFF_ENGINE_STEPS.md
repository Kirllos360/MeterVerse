# Implementation Steps — Tariff Engine

| Step ID | Objective | Files | Tests |
|:-------:|-----------|:-----:|:-----:|
| IMP-T01 | Create tariff schema with Zod validation | `routes/tariffs.js` | ✅ |
| IMP-T02 | GET /api/tariffs with active/type/date filters | `routes/tariffs.js` | ✅ |
| IMP-T03 | POST /api/tariffs with nested rates/tiers | `routes/tariffs.js` | ✅ |
| IMP-T04 | PUT /api/tariffs/:id with partial update | `routes/tariffs.js` | ✅ |
| IMP-T05 | POST /api/tariffs/calculate (tiered + flat) | `routes/tariffs.js` | ✅ |
| IMP-T06 | Audit logging on tariff create + update | `routes/tariffs.js` | ✅ |
