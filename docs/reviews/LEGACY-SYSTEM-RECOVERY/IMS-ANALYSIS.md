# LEGACY IMS — ANALYSIS

**Source:** `D:\meter\Meter\reference\ims\` (extracted counterpart of `D:\IMS.rar`)
**Date:** 2026-08-14

---

## 1. SYSTEM PROFILE

| Field | Value | Evidence |
|-------|-------|----------|
| Name | "IMS" (acronym NOT confirmed by any doc — UI prototype labeled "ims-local-test") | package.json |
| Purpose | Static multi-page utility-management UI prototype | page set |
| Stack | HTML5 + CSS3 + vanilla JS + Express static server (Node) | server.js, package.json |
| DB | **NONE** (no backend persistence) | — |
| Auth | **NONE** (prototype) | — |
| Completeness | Frontend mockup only; no business logic | file inspection |

## 2. FILE INVENTORY

| File | Purpose |
|------|---------|
| index.html | Landing |
| dashboard.html | KPI dashboard |
| customers.html | Customer list/management UI |
| meters.html | Meter management UI |
| invoices.html | Invoice list UI |
| tariffs.html | Tariff management UI |
| units.html | Unit management UI |
| reports.html | Reports UI |
| superadmin.html | Superadmin UI |
| css/base|components|layout|utilities.css | Styling |
| theme-green-pro.css + theme-injector.js | Theme engine |
| server.js | Express static file server |
| HOWTO-apply-theme.md | Theming doc |
| screen/*.png | 7 page demos |

## 3. BUSINESS MODULES (UI-level only)

Customers · Meters · Invoices · Tariffs · Units · Reports · Dashboard · Superadmin

## 4. ASSESSMENT

- **IMS is a UI-only prototype** — no API, no DB, no business rules, no auth.
- The page set (customers/meters/invoices/tariffs/reports/dashboard) mirrors the **same domain MeterVerse already implements in full** (with real backend).
- **Reuse value: LOW.** The UI is a reference for page layouts/theme approach only.

## 5. REUSE CLASSIFICATION

| Capability | Classification | Reason |
|-----------|---------------|--------|
| Multi-page UI layout patterns | **D. REFERENCE ONLY** | MeterVerse has richer shadcn/ui-based pages |
| Theme system (theme-injector) | **D. REFERENCE ONLY** | MeterVerse has adaptive theme engine |
| Any backend capability | **E. OBSOLETE** | None exists in IMS |

## 6. CONCLUSION

IMS contributes **reference-only visual patterns**. Nothing here accelerates MeterVerse; MeterVerse's existing pages are superior (confirmed by COLLECTION_SYSTEM_GAP_ANALYSIS which rates MeterVerse UI above the alternatives).
