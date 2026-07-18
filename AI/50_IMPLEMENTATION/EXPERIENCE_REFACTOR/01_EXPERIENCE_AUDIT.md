# Experience Audit — Wave-08

**Date:** 2026-07-04  
**Method:** Visual audit of all 14 routes against premium enterprise standards (Linear, Stripe, Notion, Vercel)

---

## Current Issues by Page

| Page | Issues | Severity |
|------|--------|----------|
| **Home/Foundation** | Generic shadcn cards, no visual hierarchy, default borders, no elevation | HIGH |
| **Customer Workspace** | Overcrowded KPI strip, Generic cards, No hero section, Weak typography | HIGH |
| **Customer Explorer** | Default SmartTable, No card view, Basic filters, No row hover effects | MEDIUM |
| **Meter Explorer** | Same as Customer Explorer | MEDIUM |
| **Meter Detail** | Generic tabs, flat cards, no visual hierarchy | MEDIUM |
| **Reading Explorer** | Default SmartTable, No status visual hierarchy | MEDIUM |
| **Unit Explorer** | Default SmartTable | MEDIUM |
| **Invoice Explorer** | Default SmartTable, No financial visual language | HIGH |
| **Invoice Workspace** | Generic cards, flat KPIs, No premium financial feel | HIGH |
| **Payment Explorer** | Default SmartTable | MEDIUM |
| **Payment Workspace** | Generic cards, flat KPIs | HIGH |
| **Collection Dashboard** | Basic cards, No charts, No visual hierarchy | HIGH |
| **Tariff Studio** | Basic split layout, No premium feel | MEDIUM |
| **Financial Dashboard** | Generic trend bars, No chart library | HIGH |

## Systemic Issues

| Issue | Across | Impact |
|-------|--------|--------|
| Default border-radius (6px all) | All cards | Feels generic |
| Single shadow level | All cards | No depth hierarchy |
| No hover animations | All cards | Static feel |
| Default font sizes | All pages | Weak hierarchy |
| No glass effect | Navigation | Feels flat |
| No count-up on KPIs | All KPIs | No perceived motion |
| No chart library | All dashboards | Missing key visual element |
| No page transition | All routes | Instant swap, jarring |
| No card variants | All lists | Every card looks same |
| No gradient accents | All hero areas | No brand identity |
| No status animations | All badges | Static indicators |
| Default table styling | All explorers | Generic CRUD feel |
