# Charts Implementation Plan — All MeterVerse Admin Pages

## Prerequisites (Already Satisfied)

| Item | Status | Location |
|------|--------|----------|
| Recharts npm package | ✅ Installed | `package.json` / `next.config.ts` (optimized import) |
| shadcn chart wrapper | ✅ Ready | `src/components/ui/chart.tsx` |
| Chart example components | ✅ Known | `src/features/overview/components/{bar-graph,area-graph,pie-graph}.tsx` |

## Implementation Pattern

### Chart component convention
- Place each chart as a self-contained component at `src/admin/charts/<PageName>/<ChartName>.tsx`
- Use shadcn `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` wrapper
- Fetch data via `useQuery` from a dedicated chart-data API route
- Each chart receives `data` prop (or fetches internally) and optional `className` for sizing

### API endpoint convention
- Every chart gets a dedicated API route: `src/app/api/admin/charts/<page-name>/<chart-name>/route.ts`
- Returns JSON with shape `{ data: [...], meta: { ... } }`
- Supports `?days=30&period=monthly` query params for time range

---

## Page-by-Page Plan

---

### 1. Admin Home (`/admin/home`)

**Current implementation**: Custom page, uses `SystemDashboard.tsx` with hardcoded `MiniChart` SVG bars.

**Config to change**: N/A — custom page. Replace inline `MiniChart` with Recharts.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Revenue trend (Line) | `GET /api/admin/charts/home/revenue-trend?days=365` | `{ months: [], revenue: [] }` |
| Monthly readings (Bar) | `GET /api/admin/charts/home/monthly-readings?year=2026` | `{ months: [], readings: [] }` |
| Status distribution (Pie) | `GET /api/admin/charts/home/status-distribution` | `{ statuses: [{name, count}] }` |
| Cumulative energy (Area) | `GET /api/admin/charts/home/cumulative-energy?days=365` | `{ dates: [], cumulative: [] }` |

**Layout** (4-chart grid in `SystemDashboard.tsx`):
```
┌─────────────────────────────────────────────┐
│ Header + KPI cards (unchanged)               │
├──────────────────────┬──────────────────────┤
│ Revenue Trend (Line) │ Monthly Readings (Bar)│
│ w-full h-[280px]     │ w-full h-[280px]      │
├──────────────────────┼──────────────────────┤
│ Status Distribution   │ Cumulative (Area)     │
│ (Pie) w-full h-[280] │ w-full h-[280px]      │
└──────────────────────┴──────────────────────┘
```

**Affected files**: `src/admin/dashboard/SystemDashboard.tsx`

---

### 2. Customers (`/admin/customers`)

**Current implementation**: Generic via `pageConfigs.customers`.

**Config to change**: Convert to custom page call or add `renderCustom` to `pageConfigs.customers`.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Customers per project (Bar) | `GET /api/admin/charts/customers/by-project` | `[{project, count}]` |
| Status distribution (Pie) | `GET /api/admin/charts/customers/status-distribution` | `[{name, count}]` |
| Growth trend (Line) | `GET /api/admin/charts/customers/growth?days=365` | `[{month, newCustomers, total}]` |

**Layout** (adds chart row above the GenericAdminPage table):
```
┌────────────────────────┬────────────────────────┐
│ Per-Project (Bar)      │ Status Distribution    │
│ w-1/2 h-[260px]        │ (Pie) w-1/2 h-[260px] │
├────────────────────────┴────────────────────────┤
│ Growth Trend (Line) — w-full h-[260px]           │
├─────────────────────────────────────────────────┤
│ Existing table + pagination (unchanged)          │
└─────────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/customers/page.tsx`, `src/admin/tables/page-configs.ts` (customers entry)

---

### 3. Meters (`/admin/meters`)

**Current implementation**: Generic via `pageConfigs.meters`.

**Config to change**: Add `renderCustom` or convert page to wrap `GenericAdminPage`.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Meters per type (Bar) | `GET /api/admin/charts/meters/by-type` | `[{type, count}]` |
| Status distribution (Pie) | `GET /api/admin/charts/meters/status-distribution` | `[{name, count}]` |
| Installations over time (Line) | `GET /api/admin/charts/meters/installations?days=365` | `[{month, installed}]` |

**Layout**:
```
┌────────────────────────┬────────────────────────┐
│ By Type (Bar)          │ Status (Pie)           │
│ w-1/2 h-[260px]        │ w-1/2 h-[260px]        │
├────────────────────────┴────────────────────────┤
│ Installations Over Time (Line) w-full h-[260px]  │
├─────────────────────────────────────────────────┤
│ Existing table + pagination (unchanged)          │
└─────────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/meters/page.tsx`, `src/admin/tables/page-configs.ts` (meters entry)

---

### 4. Invoices (`/admin/invoices`)

**Current implementation**: Generic via `pageConfigs.invoices`.

**Config to change**: Add `renderCustom` or convert page.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Revenue trend (Line) | `GET /api/admin/charts/invoices/revenue-trend?days=365` | `[{month, revenue}]` |
| Monthly invoice count (Bar) | `GET /api/admin/charts/invoices/monthly?year=2026` | `[{month, count, total}]` |
| Status distribution (Pie) | `GET /api/admin/charts/invoices/status-distribution` | `[{name, count}]` |
| Outstanding amount (Area) | `GET /api/admin/charts/invoices/outstanding?days=365` | `[{date, outstanding}]` |

**Layout**:
```
┌──────────────────────┬──────────────────────┐
│ Revenue (Line)       │ Monthly Count (Bar)  │
│ w-1/2 h-[260px]      │ w-1/2 h-[260px]      │
├──────────────────────┼──────────────────────┤
│ Status (Pie)         │ Outstanding (Area)   │
│ w-1/2 h-[260px]      │ w-1/2 h-[260px]      │
├──────────────────────┴──────────────────────┤
│ Existing table + pagination (unchanged)      │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/invoices/page.tsx`, `src/admin/tables/page-configs.ts` (invoices entry)

---

### 5. Payments (`/admin/payments`)

**Current implementation**: Generic via `pageConfigs.payments`.

**Config to change**: Add `renderCustom` or convert page.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Collections over time (Line) | `GET /api/admin/charts/payments/collections?days=365` | `[{month, collected}]` |
| By payment method (Bar) | `GET /api/admin/charts/payments/by-method` | `[{method, count, total}]` |
| By channel (Pie) | `GET /api/admin/charts/payments/by-channel` | `[{channel, count}]` |

**Layout**:
```
┌──────────────────────┬──────────────────────┐
│ Collections (Line)   │ By Method (Bar)      │
│ w-2/3 h-[260px]      │ w-1/3 h-[260px]      │
├──────────────────────┴──────────────────────┤
│ By Channel (Pie) — centered, w-[300px]      │
├─────────────────────────────────────────────┤
│ Existing table + pagination (unchanged)      │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/payments/page.tsx`, `src/admin/tables/page-configs.ts` (payments entry)

---

### 6. Monitoring (`/admin/monitoring`)

**Current implementation**: Custom page (`monitoring/page.tsx`) with 4 tabs: Health Dashboard / Performance / Audit Explorer / Business Analytics.

**Config to change**: N/A — custom page.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape | Placement |
|-------|----------|----------------|-----------|
| System health timeline (Line) | `GET /api/admin/charts/monitoring/health-timeline?hours=24` | `[{time, status}]` | Health tab |
| Resource usage CPU/Mem (Area) | `GET /api/admin/charts/monitoring/resources?hours=24` | `[{time, cpu, mem, disk}]` | Health tab |
| Uptime gauge | `GET /api/admin/charts/monitoring/uptime` | `{uptime, total, percent}` | Health tab |

**Layout** (within "Health Dashboard" tab):
```
┌──────────────────────┬──────────────────────┐
│ Health Timeline (Line)│ Resource Usage (Area) │
│ w-1/2 h-[280px]      │ w-1/2 h-[280px]       │
├──────────────────────┴──────────────────────┤
│ Uptime Gauge — centered, w-[240px] h-[240px] │
│ (RadialBarChart from Recharts)               │
├─────────────────────────────────────────────┤
│ Existing service cards below (unchanged)    │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/monitoring/page.tsx`

---

### 7. Readings (`/admin/readings`)

**Current implementation**: Generic via `pageConfigs.readings`.

**Config to change**: Add `renderCustom` or convert page.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Consumption trend (Line) | `GET /api/admin/charts/readings/consumption?days=90&meterId=` | `[{date, value}]` |
| Monthly comparison (Bar) | `GET /api/admin/charts/readings/monthly-comparison?year=2026` | `[{month, current, previous}]` |
| Outlier scatter (Scatter) | `GET /api/admin/charts/readings/outliers?days=30` | `[{date, value, meter}]` |

**Layout**:
```
┌──────────────────────┬──────────────────────┐
│ Consumption (Line)   │ Monthly Comparison   │
│                      │ (Bar)                │
│ w-1/2 h-[280px]      │ w-1/2 h-[280px]      │
├──────────────────────┴──────────────────────┤
│ Outlier Detection (ScatterChart)             │
│ w-full h-[300px]                             │
├─────────────────────────────────────────────┤
│ Existing table + pagination (unchanged)      │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/readings/page.tsx`, `src/admin/tables/page-configs.ts` (readings entry)

---

### 8. Collections (`/admin/collections`)

**Current implementation**: **Does not exist.** No route, no page, no config.

**Config to change**: Create new page + route entry + `pageConfigs.collections`.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Aging buckets (Bar) | `GET /api/admin/charts/collections/aging` | `[{bucket, amount, count}]` |
| Recovery rate (Line) | `GET /api/admin/charts/collections/recovery-rate?days=365` | `[{month, rate}]` |
| Status distribution (Pie) | `GET /api/admin/charts/collections/status-distribution` | `[{name, count}]` |

**Layout**:
```
┌──────────────────────┬──────────────────────┐
│ Aging Buckets (Bar)  │ Status (Pie)         │
│ w-2/3 h-[280px]      │ w-1/3 h-[280px]      │
├──────────────────────┴──────────────────────┤
│ Recovery Rate (Line) — w-full h-[260px]      │
├─────────────────────────────────────────────┤
│ Table: collection items with status/amount   │
└─────────────────────────────────────────────┘
```

**New files needed**: `src/app/admin/collections/page.tsx`, update `src/app/admin/page.tsx` pageMap, `src/admin/tables/page-configs.ts`, `src/app/api/admin/charts/collections/*`

---

### 9. RCA (`/admin/rca-workspace`)

**Current implementation**: Custom page (`rca-workspace/page.tsx`) with case list, create form, analysis panel.

**Config to change**: N/A — custom page. Add chart row over the case list.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Cases by status (Bar) | `GET /api/admin/charts/rca/by-status` | `[{status, count}]` |
| Resolution time (Line) | `GET /api/admin/charts/rca/resolution-time?days=90` | `[{date, avgHours}]` |

**Layout** (above the case list, below the header):
```
┌──────────────────────┬──────────────────────┐
│ Cases by Status (Bar)│ Resolution Time (Line)│
│ w-1/2 h-[240px]      │ w-1/2 h-[240px]       │
├──────────────────────┴──────────────────────┤
│ Existing stats bar + create form + case list │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/rca-workspace/page.tsx`

---

### 10. AI Operations (`/admin/ai-operations`)

**Current implementation**: Custom page (`ai-operations/page.tsx`) with health cards, knowledge search, AI findings.

**Config to change**: N/A — custom page. Add chart row below the health KPI cards.

**Chart data API endpoints needed**:

| Chart | Endpoint | Response shape |
|-------|----------|----------------|
| Model performance (Line) | `GET /api/admin/charts/ai/model-performance?days=30` | `[{date, accuracy, latency}]` |
| Model usage (Bar) | `GET /api/admin/charts/ai/usage` | `[{model, calls, tokens}]` |

**Layout** (inserted between KPI cards and knowledge search):
```
┌──────────────────────┬──────────────────────┐
│ Model Performance    │ Model Usage (Bar)     │
│ (Line dual-axis)     │ w-1/2 h-[260px]       │
│ w-1/2 h-[260px]      │                       │
├──────────────────────┴──────────────────────┤
│ Existing Knowledge Search + AI Findings list │
└─────────────────────────────────────────────┘
```

**Affected files**: `src/app/admin/ai-operations/page.tsx`

---

## Implementation Order

| Phase | Pages | Rationale |
|-------|-------|-----------|
| Phase 1 | Home, Monitoring | Custom pages, no `GenericAdminPage` refactoring needed |
| Phase 2 | Invoices, Payments | Highest business value — revenue data |
| Phase 3 | Customers, Meters, Readings | CRUD pages, need `renderCustom` wiring |
| Phase 4 | RCA, AI Operations | Custom pages, lower complexity |
| Phase 5 | Collections | New page — create from scratch last |

## Shared Components to Create

| Component | Path | Description |
|-----------|------|-------------|
| `ChartCard` | `src/admin/charts/ChartCard.tsx` | Wrapper: Card + ChartContainer + optional header/dropdown |
| `LineChartCard` | `src/admin/charts/LineChartCard.tsx` | Reusable line chart with configurable dataKey, XAxis |
| `BarChartCard` | `src/admin/charts/BarChartCard.tsx` | Reusable bar chart |
| `PieChartCard` | `src/admin/charts/PieChartCard.tsx` | Reusable donut/pie chart |
| `AreaChartCard` | `src/admin/charts/AreaChartCard.tsx` | Reusable area chart |
| `ScatterChartCard` | `src/admin/charts/ScatterChartCard.tsx` | Reusable scatter/outlier chart |
| `GaugeCard` | `src/admin/charts/GaugeCard.tsx` | Radial bar for uptime |

## New API Routes to Create (18 total)

```
src/app/api/admin/charts/home/revenue-trend/route.ts
src/app/api/admin/charts/home/monthly-readings/route.ts
src/app/api/admin/charts/home/status-distribution/route.ts
src/app/api/admin/charts/home/cumulative-energy/route.ts
src/app/api/admin/charts/customers/by-project/route.ts
src/app/api/admin/charts/customers/status-distribution/route.ts
src/app/api/admin/charts/customers/growth/route.ts
src/app/api/admin/charts/meters/by-type/route.ts
src/app/api/admin/charts/meters/status-distribution/route.ts
src/app/api/admin/charts/meters/installations/route.ts
src/app/api/admin/charts/invoices/revenue-trend/route.ts
src/app/api/admin/charts/invoices/monthly/route.ts
src/app/api/admin/charts/invoices/status-distribution/route.ts
src/app/api/admin/charts/invoices/outstanding/route.ts
src/app/api/admin/charts/payments/collections/route.ts
src/app/api/admin/charts/payments/by-method/route.ts
src/app/api/admin/charts/payments/by-channel/route.ts
src/app/api/admin/charts/monitoring/health-timeline/route.ts
src/app/api/admin/charts/monitoring/resources/route.ts
src/app/api/admin/charts/monitoring/uptime/route.ts
src/app/api/admin/charts/readings/consumption/route.ts
src/app/api/admin/charts/readings/monthly-comparison/route.ts
src/app/api/admin/charts/readings/outliers/route.ts
src/app/api/admin/charts/collections/aging/route.ts
src/app/api/admin/charts/collections/recovery-rate/route.ts
src/app/api/admin/charts/collections/status-distribution/route.ts
src/app/api/admin/charts/rca/by-status/route.ts
src/app/api/admin/charts/rca/resolution-time/route.ts
src/app/api/admin/charts/ai/model-performance/route.ts
src/app/api/admin/charts/ai/usage/route.ts
```

## GenericAdminPage Integration Strategy

For pages 2–5 and 7 (customers, meters, invoices, payments, readings):

**Option A (recommended)**: Convert each page from a one-liner to a custom wrapper:

```tsx
// src/app/admin/invoices/page.tsx — NEW pattern
export default function AdminInvoicesPage() {
  return (
    <div className="space-y-6">
      <ChartsRow /> {/* new chart components */}
      <GenericAdminPage config={pageConfigs["invoices"]} />
    </div>
  )
}
```

This avoids changes to `GenericAdminPage.tsx` or `page-configs.ts`. Each page imports its own chart row component from `src/admin/charts/Invoices/`.

## Summary Statistics

| Metric | Count |
|--------|-------|
| Pages with new/updated charts | 10 |
| Chart types: Line | 11 |
| Chart types: Bar | 11 |
| Chart types: Pie | 7 |
| Chart types: Area | 3 |
| Chart types: Scatter | 1 |
| Chart types: Gauge (RadialBar) | 1 |
| **Total chart instances** | **34** |
| New API route handlers needed | 30 |
| New chart component files | ~34 (one per chart) |
| New shared chart wrappers | 7 |
| Pages needing GenericAdminPage refactor | 5 (customers, meters, invoices, payments, readings) |
| New pages to create from scratch | 1 (collections) |
