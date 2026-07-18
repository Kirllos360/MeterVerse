# MeterVerse Chart DNA

**Defines chart types, usage rules, accessibility, and data visualization principles.**

---

## 1. Chart Library

**Recharts** is the approved charting library (already in dependency tree). Use these chart types:

| Chart | Use Case | Variants |
|-------|----------|----------|
| AreaChart | Trends over time | Stacked, percentage, smoothed |
| BarChart | Comparisons | Vertical, horizontal, stacked, grouped |
| PieChart | Distribution | Donut (preferred), pie |
| LineChart | Multiple series trends | Multi-line with dots |
| RadarChart | Multi-dimensional comparison | — |
| ComposedChart | Mixed chart types (bar + line) | — |

## 2. Chart Rules

| Rule | Implementation |
|------|---------------|
| No 3D charts | Flat, 2D only |
| No pie charts with >5 slices | Group small slices into "Other" |
| Tooltip on hover | Always show value, label, and color indicator |
| Legend at bottom | Clickable to toggle series |
| Responsive | Charts resize with container |
| Animated entrance | Fade-in on initial render (300ms) |
| Empty state | "No data available" message |
| Loading state | Skeleton chart outline |

## 3. Chart Colors

Use the 8-color chart palette from COLOR_SYSTEM.md:
- Primary series: Chart-1
- Secondary series: Chart-2
- And so on through Chart-8
- Status colors for status-related charts (success=green, error=red)

## 4. Chart Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Data table alternative | Tabular data below chart |
| aria-label | Chart element has descriptive label |
| Pattern fills | Use patterns NOT color alone for differentiation |
| Keyboard navigation | Tab through data points |
| Screen reader | Data values announced on focus |

## 5. Chart Sizing

| Chart | Recommended Width | Recommended Height |
|-------|------------------|-------------------|
| KPI Sparkline | 100% of card | 60px |
| Dashboard chart | 100% of widget | 300px |
| Full-page chart | 100% of container | 450px |
| Modal chart | 100% of modal | 400px |

## 6. Chart Interactivity

| Interaction | Behavior |
|-------------|----------|
| Hover on data point | Tooltip with exact values |
| Click on data point | Drill-down or detail view |
| Click on legend | Toggle series visibility |
| Click on bar/pie segment | Filter or drill-down |
| Brush (range selector) | Available for time-series charts |
| Zoom | Available for detailed analysis views |
