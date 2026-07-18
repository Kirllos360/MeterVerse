# MeterVerse Experience DNA — Enterprise Product Constitution

**Version:** 2.0.0  
**Status:** PERMANENT — governs all MeterVerse frontend implementation  
**Authority:** Supersedes all previous experience documents  
**Scope:** Every pixel, every interaction, every page, every component  

---

## 1. Product Philosophy

### Why MeterVerse Exists
MeterVerse exists because utility management is infrastructure. 50,000 meters, 15 areas, 5 utility types, millions in monthly billing — this is not a spreadsheet problem. It is an operating system problem.

### What MeterVerse Is
MeterVerse is an **Enterprise Utility Operating System**. Not an ERP. An operating system means: it runs the business of utility metering from end to end. It assigns meters, validates readings, calculates consumption, applies tariffs, generates invoices, records payments, manages collections, and provides intelligence — all in one unified platform.

### What MeterVerse Is NOT
- Not a generic ERP (no HR, no procurement, no inventory)
- Not a dashboard builder (dashboards are role-specific, not configurable)
- Not a low-code platform (business rules are enforced, not configured by users)
- Not a page collection (every page is part of a workflow)

---

## 2. Product Personality

| Trait | Description |
|-------|-------------|
| **Professional** | Clean, structured, no gimmicks. Every pixel has purpose. |
| **Intelligent** | Anticipates user needs. Suggests next steps. Detects anomalies before users do. |
| **Calm** | Enterprise software should not be exciting. It should be reliable. Predictable. Boring in the best way — boring means nothing breaks. |
| **Confident** | Bold colors, clear typography, decisive interactions. No hesitation in the UI. |
| **Fast** | Not just load times — perceived speed. Optimistic updates, instant feedback, no waiting. |
| **Data-dense** | Shows maximum information with minimum clutter. Every screen is information-rich. |
| **Utility-first** | Designed for electricity, water, gas, solar professionals. Not generic enterprise. |

---

## 3. Enterprise Principles

| Principle | Rule | Example |
|-----------|------|---------|
| **Single source of truth** | Every piece of data appears in exactly one primary location. Duplicates are references. | Customer balance appears on Customer Hero, not re-calculated on every page. |
| **Progressive disclosure** | Show essentials first. Reveal complexity on demand. Never overwhelm. | Meter list shows serial, type, status. Advanced filters are one click away. |
| **Forgiveness** | Warn before irreversible actions. Support undo where possible. Every destructive action requires typed confirmation. | "Type DELETE to confirm meter termination." |
| **Feedback** | Every action produces immediate, clear feedback. No silent failures. | Toast on success, inline error on failure. |
| **Context preservation** | Navigation preserves filters, scroll position, selections. Users never start over. | Table page remembers page number when returning from detail view. |
| **Error prevention** | Block impossible actions before they reach the API. | Cannot assign meter without unit. Cannot invoice without tariff. |
| **Status visibility** | Every entity shows its current state and available transitions. | Meter status badge shows "Active" with available actions: Replace, Terminate, Maintenance. |
| **Permission awareness** | Users never see what they cannot do. No 403 errors. Ever. | Technician role does not render "Generate Invoice" button. |

---

## 4. Utility Principles

| Principle | Rule |
|-----------|------|
| **Meter-first** | The meter is the atomic unit. Everything derives from meter data. |
| **Reading drives billing** | Reading quality determines billing accuracy. The reading pipeline (capture → validate → approve → bill) is sacred. |
| **Consumption intelligence** | Raw readings are data. Consumption trends, anomalies, and forecasts are intelligence. Always compute, never show raw. |
| **Financial integrity** | Every invoice matches its readings. Every payment matches its invoice. Every ledger entry is auditable. |
| **Area isolation** | Data never leaks between areas. Cross-area operations require explicit super-admin privileges. |

---

## 5. Emotional Design

| State | Emotion | Visual Behavior |
|-------|---------|----------------|
| **Loading** | Anticipation | Skeleton shimmer with brand-colored pulse. Progress is visible. Never a blank screen. |
| **Success** | Relief | Green checkmark with brief scale animation. Toast auto-dismisses after 4s. |
| **Error** | Frustration prevention | Red banner with clear explanation of what happened AND how to fix it. Never just "Error." |
| **Empty** | Curiosity | Illustration + explanation + call to action. Never "No data." Always "Add your first meter to get started." |
| **Critical** | Urgency | Red pulsing banner at the top of the viewport. Action required button. Sound notification (future). |
| **Offline** | Understanding | Yellow banner. Non-critical features gracefully disabled. Critical features show cached data. |

---

## 6. Information Density Rules

| Density | Row Height | Padding | Font Size | Use Case |
|---------|-----------|---------|-----------|----------|
| **Comfortable** | 56px | 16px | 14px | Default. Lists with complex data. |
| **Compact** | 40px | 12px | 13px | High-density data review. |
| **Condensed** | 32px | 8px | 12px | Bulk operations. Mass data entry. |

- Default to Comfortable. Let users switch to Compact.
- Never default to Condensed — that is a power-user option.
- Density is a per-user preference, persisted to localStorage.

---

## 7. Cognitive Load Rules

- **7±2 rule:** Never show more than 7 primary navigation items. Group overflow into "More."
- **3-click rule:** Any action should be reachable within 3 clicks from the page's natural entry point.
- **One primary action per page:** Every page has exactly one primary call-to-action. Everything else is secondary.
- **Section limits:** Maximum 6 KPI cards per row. Maximum 4 tabs visible at once (overflow into "More" dropdown).
- **Data limits:** Table default page size is 25. Never show more than 100 rows without filtering.

---

## 8. Visual Hierarchy

| Level | Element Size | Weight | Color | Purpose |
|-------|-------------|--------|-------|---------|
| **1 — Hero** | 24-30px | Bold | text-primary | Page title, entity name |
| **2 — Section** | 18px | Semibold | text-primary | Section heading |
| **3 — Card Title** | 14px | Semibold | text-primary | Card heading |
| **4 — Body** | 14px | Normal | text-secondary | Content text |
| **5 — Data Value** | 14-24px | Bold | text-primary | KPIs, metrics |
| **6 — Meta** | 12px | Medium | text-tertiary | Labels, captions, timestamps |
| **7 — Badge** | 11px | Semibold | status | Status, tags, categories |

**Reading flow:** Top-left to bottom-right (LTR). Top-right to bottom-left (RTL). Eyes land on Hero → scan KPI strip → read detail sections → find actions.

---

## 9. Scanning Pattern

Users scan enterprise pages in an **F-pattern**:
1. **Horizontal strip** across the top (Hero + KPI strip)
2. **Vertical strip** down the left side (sidebar or first column)
3. **Second horizontal strip** across the middle (detail content)

Design for the F-pattern: place the most important information in the top-left quadrant, actions on the right, detail in the middle.

---

## 10. Enterprise Navigation Philosophy

- **Sidebar is primary navigation.** Always visible. Collapsible to icons-only.
- **Top nav is secondary.** Context switching (workspace, area, project) and utilities (search, notifications, user menu).
- **Breadcrumbs are tertiary.** Show location in hierarchy. Clickable for lateral navigation.
- **Command palette is universal.** Ctrl+K from anywhere. Search pages, entities, and actions.

---

## 11. Enterprise Dashboard Philosophy

- Every dashboard is role-specific. An operator sees different KPIs than an executive.
- Dashboards are information radiators. They show, they don't hide. All relevant data is visible at a glance.
- KPI strip at top: 4-6 metrics that define the health of that domain.
- Widget grid below: charts, tables, activity feeds, alert summaries.
- Every widget is clickable. Click navigates to the detail view.

---

## 12. CRM Philosophy (Customer Workspace)

The Customer Workspace is the single most complex page in MeterVerse. It must show:
- Who the customer is (identity, status, tags)
- What they owe (balance, outstanding, aging)
- What they have (units, meters)
- What they've done (payments, readings, invoices)
- What's happening now (alerts, warnings, suggestions)
- What happened in the past (timeline, audit, activity)
- What can be done next (quick actions, workflow suggestions)

Layout: Hero → KPI strip → Smart Panel (warnings) → Tabs → Timeline → Relationships

---

## 13. Finance Philosophy

Financial pages must feel solid. Money is at stake. Every financial display should:
- Use currency formatting with exactly 2 decimal places
- Show running balances with clear positive/negative indicators
- Never round ambiguously
- Show audit trails for every transaction
- Require confirmation for every financial action
- Display both total and unit amounts

---

## 14. Monitoring Philosophy

Monitoring pages are about **exception detection**. The UI should:
- Show healthy systems as calm, green, stable
- Make problems visually prominent (red, pulsing, attention-grabbing)
- Provide drill-down from "something is wrong" to "this specific meter is offline since 14:32"
- Auto-refresh at appropriate intervals (10s for real-time, 30s for status, 60s for data)

---

## 15. Accessibility Philosophy

WCAG 2.2 AA is the minimum. AAA is the target where practical.

- Every interactive element is keyboard-accessible
- Every image has alt text
- Every icon has aria-label
- Every form field has an associated label
- Every status change is announced via aria-live
- Every animation respects prefers-reduced-motion
- Every color combination meets 4.5:1 contrast ratio
- Every touch target is minimum 44x44px
- The application works at 400% zoom

---

## 16. Design Governance

| Rule | Enforcement |
|------|------------|
| No hardcoded colors | Lint rule. CI fails if raw hex/hsl appears in component CSS. |
| No hardcoded spacing | Lint rule. All spacing uses space-{n} tokens. |
| No page-specific components | Architecture review. Every new component must prove it is not duplicating an existing one. |
| No duplicated functionality | Code review. If two components do the same thing, one must be removed. |
| Every component must define all states | Component template check. Missing states = CI warning. |
| Every component must be responsive | Playwright test at 4 viewports. |
| Every component must support RTL | Visual regression test with dir="rtl". |
| Every component must support 4 themes | Visual regression test for light/dark/gray/adaptive. |
