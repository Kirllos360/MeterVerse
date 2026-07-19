# MeterVerse Comprehensive Visual Audit

**Date:** 2026-07-19  
**Screenshots:** 60 (9 groups × 3 viewports + themes + RTL)  
**Audit Type:** Full enterprise visual review

---

## Screenshot Inventory

| Group | Desktop | Tablet | Mobile | Total |
|-------|---------|--------|--------|-------|
| Pages | 8 | 8 | 8 | 24 |
| Dialogs | 1 | 1 | 1 | 3 |
| Drawers | 1 | 1 | 1 | 3 |
| Sidebar | 2 | 2 | 2 | 6 |
| Inspector | 2 | 2 | 2 | 6 |
| Toolbar | 2 | 2 | 2 | 6 |
| Tables | 2 | 2 | 2 | 6 |
| Empty States | 1 | 1 | 1 | 3 |
| Loading States | 1 | 1 | 1 | 3 |
| **Total** | 20 | 20 | 20 | **60** |

---

## Issues Found

### 🔴 Critical (Must Fix)

| # | Location | Problem | Recommendation |
|---|----------|---------|---------------|
| 1 | Login page (all viewports) | Brand left panel uses `--panel-accent` derived from brand at 22% — very dark, text contrast is low | Increase brand mix to 30-35% for better readability, or use a slightly lighter shade for secondary text |
| 2 | Login page mobile | Brand panel hidden on mobile, user sees only form — no brand context | Show logo at top of form (currently done but could be larger) |
| 3 | Inspector page | Entity type selector at bottom uses tiny text (9px) with alternating brand/transparent backgrounds — hard to read | Increase to 11px, use full labels instead of abbreviation |
| 4 | Dialog component | No visible close button when content is short — relies on overlay click | Always show close button in top-right corner |

### 🟡 High (Should Fix)

| # | Location | Problem | Recommendation |
|---|----------|---------|---------------|
| 5 | Workspace page (desktop) | Sidebar + inspector borders use `--border-subtle` which can disappear on low-contrast displays | Use `--border-default` for container boundaries |
| 6 | Workspace page (tablet) | Sidebar at 72px collapsed — icons are single letters, not meaningful | Use actual SVG icons (already defined in ICONS map but not shown in collapsed mode) |
| 7 | Admin pages | All admin pages use `var(--admin-accent)` which is `var(--status-error)` (red) — this makes the entire admin feel like an error state | Use `var(--brand)` as admin accent for consistency with the rest of the app |
| 8 | Not-found page | Uses default Next.js 404 styling | Add branded 404 page with MeterVerse logo and navigation options |
| 9 | Dialog backdrop | Uses `rgba(var(--black-rgb), 0.4)` — same as drawer | Consider using `rgba(var(--black-rgb), 0.5)` for dialogs (stronger backdrop for modal content) |
| 10 | Drawer backdrop | Uses `rgba(var(--black-rgb), 0.3)` — reasonable but could be more consistent | Standardize all backdrop opacities to a token `--backdrop-opacity: 0.4` |

### 🟢 Medium (Nice to Fix)

| # | Location | Problem | Recommendation |
|---|----------|---------|---------------|
| 11 | Sidebar collapsed | No tooltip on hover for collapsed items — users must expand to see labels | Add tooltip on hover (the code exists but uses deprecated group-hover/item syntax) |
| 12 | Table view | No row hover state (rows don't highlight on hover) | Add `hover:bg-[var(--border-subtle)]` to table rows |
| 13 | Card grid | All cards identical size/weight — no visual prioritization of important data | Add size variants (compact, default, featured) |
| 14 | Empty states | No empty state for workspace when no tabs are open | Add welcome/onboarding message (currently shows WorkspaceHome which is good) |
| 15 | Loading states | Skeleton animation uses `animate-pulse` which is not consistent with framer-motion animations used elsewhere | Use framer-motion for skeleton to match the app's animation language |
| 16 | RTL on mobile | Arabic layout works but spacing feels cramped | Increase padding to 16px for RTL mobile layouts |
| 17 | Tablet responsive | Content area on tablet is narrow due to sidebar (72px) + padding | Consider auto-hiding sidebar on tablet to give content more room |

### 🔵 Low (Future)

| # | Location | Problem | Recommendation |
|---|----------|---------|---------------|
| 18 | Admin AI Diagnostics page | Uses red (`var(--status-error)`) accent throughout — feels alarming | Use brand accent instead of error color |
| 19 | MetricsDashboard | Chart colors hardcoded (`#3B82F6`, `#22C55E`, `#F59E0B`) | Define chart color tokens that derive from brand palette |
| 20 | Login dashboard preview | Only visible on `xl:block` — not visible on smaller screens | Show simplified version on tablet |
| 21 | Dialog animation | Uses spring animation while other components use cubic-bezier | Use same easing as sidebar/inspector |
| 22 | Drawer animation | Spring animation (stiffness: 300, damping: 30) | Standardize to cubic-bezier or match dialog easing |

---

## Design Token Compliance

| Token | Status | Issues |
|-------|--------|--------|
| `--brand` | ✅ Single source | All brand colors derive from `--brand` after Phase 37 migration |
| `--surface-*` | ✅ Consistent | Page bg, cards, inputs, toolbar all use surface tokens |
| `--text-*` | ✅ Consistent | primary/secondary/tertiary used throughout |
| `--border-*` | ⚠️ border-subtle too subtle on some screens | Consider increasing opacity from 5% to 8% |
| `--shadow-*` | ✅ Standardized | shadow-sm/md/lg used consistently after Phase 37 |
| `--space-*` | ✅ Mostly | Some p-3 values used (12px is in scale) |
| `--radius-*` | ⚠️ Admin uses rounded-lg (8px) while workspace uses rounded-xl (12px) | Should standardize to one radius scale |

---

## Theme Comparison

| Feature | Light | Dark | RTL |
|---------|-------|------|-----|
| Sidebar | Dark teal (22% brand) | Same (brand-derived) | ✅ Works |
| Inspector | Dark teal (15% brand) | Same | ✅ Works |
| Toolbar | surface-topbar | surface-topbar dark | ✅ Works |
| Cards | surface-raised | Dark raised | ✅ Works |
| Text contrast | ✅ Good | ✅ Good | ✅ Works |
| Brand colors | ✅ Consistent | ✅ Consistent | ✅ Works |

---

## Summary

| Severity | Count | Action |
|----------|-------|--------|
| 🔴 Critical | 4 | Fix before next release |
| 🟡 High | 6 | Fix this sprint |
| 🟢 Medium | 7 | Fix when time permits |
| 🔵 Low | 5 | Future enhancement |
| **Total** | **22** | |

**Top 3 recommendations:**
1. Change admin accent from `--status-error` (red) to `--brand` (teal)
2. Standardize dialog/drawer backdrop opacities to a single token
3. Add hover states to table rows and sidebar collapsed tooltips
