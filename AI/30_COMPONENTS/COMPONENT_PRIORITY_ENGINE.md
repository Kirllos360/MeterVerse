# MeterVerse Component Priority Engine

**Version:** 2.0.0  
**Authority:** Every component's behavior, importance, and interaction priority.

---

## 1. Priority Levels

| Level | Label | Render Priority | Memory Priority | Network Priority |
|-------|-------|----------------|----------------|-----------------|
| P0 | Critical | Immediate | Always mounted | Prefetch |
| P1 | High | Next frame | Keep alive | Load on idle |
| P2 | Medium | Visible only | Drop on scroll | Lazy load |
| P3 | Low | Deferred | Drop when hidden | Load on demand |

---

## 2. Component Priority Registry

| Component | Priority | Visual Weight | Collapse | Expand |
|-----------|----------|--------------|----------|--------|
| Sidebar | P0 | High | Icons-only | Full |
| TopNav | P0 | Medium | Condensed | Full |
| Breadcrumbs | P2 | Low | Hidden on mobile | Show on desktop |
| CustomerHero | P0 | High | Sticky compact | Full |
| KPI Cards | P1 | Medium | Scroll horizontally | Grid |
| Warning Banners | P0 | High | Dismiss | Show animation |
| SmartTable | P1 | High | Card view on mobile | Full table |
| Charts | P2 | Medium | Hide on mobile | Show on desktop |
| Timeline | P2 | Medium | Show 5, load more | Full timeline |
| Side Panel | P2 | Low | Collapse to bottom | Full panel |
| Activity Feed | P2 | Low | Show 3, load more | Full feed |
| Footer | P3 | Low | Hidden on mobile | Show on desktop |
| Notifications | P1 | Medium | Badge count | Full dropdown |
| Command Palette | P0 (when open) | High | — | Full overlay |

---

## 3. Interaction Priority

| Interaction | Keyboard | Touch | Mouse | Screen Reader |
|-------------|----------|-------|-------|---------------|
| Navigate | Tab / Arrow keys | Swipe / Tap | Click | Swipe / Tap |
| Primary action | Enter | Double-tap | Click | Activate |
| Secondary action | Shift+Enter | Long press | Right-click | Context menu |
| Cancel | Escape | Swipe back | Click outside | Dismiss |
| Search | Ctrl+K | Tap search | Click search | Search landmark |
| Save | Ctrl+S | Tap save | Click save | Submit form |

---

## 4. Performance Priority

| Component | Load Strategy | Render Strategy | Update Strategy |
|-----------|--------------|----------------|-----------------|
| Sidebar | Eager | Always | Never (static) |
| TopNav | Eager | Always | On auth change |
| Tables | Lazy | Virtualized | On data change |
| Charts | Lazy | Canvas/SVG | On data change |
| KPIs | Eager | Hydrate once | On interval |
| Notifications | Eager | Badge only | Poll 30s |
| Timeline | Lazy | Paginated | On scroll |
| Side Panel | Lazy | Conditional | On toggle |
