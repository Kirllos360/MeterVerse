# MeterVerse Table DNA (SmartTable)

**Defines the data table component behavior, features, and usage rules.**

---

## 1. Table Features

| Feature | Support | Default |
|---------|---------|---------|
| Column sorting | ✅ Asc/desc/null toggle | None |
| Global search | ✅ Text search across all columns | Enabled |
| Column filters | ✅ Dropdown per column type | None |
| Pagination | ✅ Full controls (first/prev/next/last) | 25 rows |
| Row selection | ✅ Single (click) and Multi (checkbox) | None |
| Row actions | ✅ Dropdown menu per row | None |
| Loading state | ✅ Skeleton animation | Automatic |
| Empty state | ✅ Illustration + message + CTA | Automatic |
| Mobile view | ✅ Card-based layout | <768px |
| Export | ✅ CSV, XLSX | Via toolbar |
| Column grouping | ✅ Group rows by column value | Optional |
| Column resizing | ✅ Drag to resize | Optional |
| Sticky header | ✅ Header stays visible on scroll | Enabled |
| Sticky columns | ✅ First column freeze | Optional |

## 2. Table States

| State | Visual | Trigger |
|-------|--------|---------|
| Loading | Skeleton rows (6 placeholder rows) | Data fetching |
| Empty | Centered illustration + message + CTA | No data |
| Populated | Normal table display | Data present |
| Error | Error banner above table | API failure |
| Refreshing | Fade overlay on table body | Background refresh |

## 3. Table Responsive Behavior

- **Desktop (>=1024px):** Full table with all columns
- **Tablet (768-1023px):** Full table with horizontal scroll if needed
- **Mobile (<768px):** Card layout — each row renders as a stacked card
- Column priority: hide least important columns on smaller screens

## 4. Column Types

| Type | Display | Filter | Sort |
|------|---------|--------|------|
| Text | Standard text | Text search | Alphabetical |
| Number | Right-aligned, monospace | Range slider | Numeric |
| Currency | Right-aligned, currency symbol | Range slider | Numeric |
| Date | Formatted date | Date range | Chronological |
| Status | Badge component | Status dropdown | By status order |
| Enum | Localized label | Dropdown | Alphabetical |
| Actions | Dropdown menu | None | None |

## 5. Bulk Actions

| Feature | Behavior |
|---------|----------|
| Selection | Checkbox column, Shift+click for range |
| Action bar | Appears above table when rows selected |
| Bulk actions | Vary by entity (delete, export, change status) |
| Select all | Checkbox in header selects all visible rows |
| Deselect | Click selected row or clear button |

## 6. Table Accessibility

- `<table>` element with `<thead>`, `<tbody>`, `<th scope="col">`
- Sort indicators have aria-sort attribute
- Pagination has aria-label and aria-current
- Row selection announced via aria-live
- Loading state uses aria-busy="true"
- Empty state has role="status" and aria-live="polite"
