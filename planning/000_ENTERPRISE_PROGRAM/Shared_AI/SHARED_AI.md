# Shared AI

## AI Architecture

| Component | Status | Wave |
|-----------|--------|------|
| ai-engine.js (backend service) | ✅ Basic route exists | Wave 01 |
| AI chat endpoint (/api/ai) | ✅ Basic route exists | Wave 01 |
| KPI engine (kpi-engine.js) | ✅ 6 KPI definitions + snapshots | Wave 01 |
| Anomaly Detection | ⏳ Planned | Wave 05 |
| Consumption Forecasting | ⏳ Planned | Wave 05 |
| Payment Prediction | ⏳ Planned | Wave 05 |
| AI Chat Assistant | ⏳ Planned | Wave 05 |

## AI Principles
1. AI is a shared service — both System A and B use the same engine
2. AI never has direct database access — always through the API layer
3. All AI decisions are auditable via AuditEntry
4. AI models are versioned and swappable without code changes

## Current AI Capabilities
- KPI snapshots record daily metrics for 6 business dimensions
- Alert engine evaluates condition-based rules against entity data
- Monitoring middleware tracks all requests for behavioral analysis

## AI Data Sources
- AuditEntry (all user actions)
- ActivityStream (all request tracking)
- KpiSnapshot (daily business metrics)
- Reading data (meter consumption patterns)
- Invoice/Payment data (billing patterns)
