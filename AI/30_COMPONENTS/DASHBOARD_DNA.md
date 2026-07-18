# MeterVerse Dashboard DNA

**Defines dashboard architecture, widget composition, KPI display, and layout rules.**

---

## 1. Dashboard Architecture

Every dashboard follows this structure:
```
Dashboard Page
├── KPI Strip (4-6 metric cards in a row)
├── Main Content Area (grid of widgets)
│   ├── Charts (area, bar, pie, line)
│   ├── Tables (top-N lists, status summaries)
│   ├── Activity Feed (timeline of recent events)
│   └── Alert Summary (current alerts by severity)
└── Context Panel (optional, right-side)
    ├── Filters (date range, project, area)
    └── Quick Actions (common tasks)
```

## 2. KPI Cards

| Element | Specification |
|---------|--------------|
| Background | Surface-raised with subtle shadow |
| Icon | Top-left, 32px, colored by metric type |
| Label | Small text, text-text-secondary |
| Value | Large bold text (text-2xl to text-4xl) |
| Trend | Green/red indicator with percentage |
| Period | "vs last month" or "vs last period" |
| Click behavior | Navigates to detail view |

## 3. Dashboard Widgets

| Widget | Purpose | Size (columns) |
|--------|---------|----------------|
| KPI Strip | Top-level metrics | Full width |
| Area Chart | Trends over time | 6 cols |
| Bar Chart | Comparisons | 6 cols |
| Pie Chart | Distribution | 4 cols |
| Line Chart | Multiple series | 8 cols |
| Data Table | Entity list | 12 cols |
| Activity Feed | Recent events | 4 cols |
| Alert Summary | Current alerts | 4 cols |
| Status Grid | Entity health | 6 cols |
| Quick Actions | Common tasks | 4 cols |

## 4. Dashboard Types

| Type | Purpose | Widgets |
|------|---------|---------|
| Executive | CEO-level KPIs | KPI strip, top-N lists, AI insights |
| Operations | Daily monitoring | KPI strip, status grids, alert summary |
| Billing | Financial review | KPI strip, revenue chart, invoice table |
| Collections | Debt management | KPI strip, aging buckets, top debtors |
| Utility | Per-utility metrics | KPI strip per utility tab |
| Solar | Solar production | KPI strip, production chart, wallet |
| Custom | User-defined | Configurable widget grid |

## 5. Dashboard Responsive Behavior

- **Desktop (>=1024px):** Multi-column grid layout
- **Tablet (768-1023px):** 2-column grid, KPI strip wraps to 3 per row
- **Mobile (<768px):** Single column, KPI strip scrolls horizontally
- Widgets reflow automatically based on available width

## 6. Dashboard Filtering

- Global filters at dashboard level (date range, project, area)
- Filters apply to all widgets simultaneously
- Each widget can have additional entity-specific filters
- Filter state persists during navigation (session storage)
- Filter reset button in filter bar
