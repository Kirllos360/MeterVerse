# MeterVerse Migration Guide — Legacy to New Frontend

**Defines how to migrate pages from the legacy frozen frontend to the new MeterVerse UI.**

---

## 1. Migration Principles

- **Only the visual layer is rebuilt.** Business logic, API calls, auth, and permissions are reused from the backend.
- **Pages are migrated one by one** in priority order (P0→P5).
- **Each migrated page replaces the legacy version** in the new App Shell.
- **No legacy file is modified.** Legacy remains frozen as a reference.
- **Each migration is a complete phase** with its own quality gate.

## 2. Migration Process

### Step 1: Inventory
- Locate the page in the legacy inventory (`legacy-ui/inventory-report.md`)
- Identify: route, components, hooks, API calls, permissions
- Take screenshots of the current UI for visual comparison

### Step 2: Design
- Determine the page archetype (Dashboard, CRUD, Detail, Wizard, etc.)
- Reference `AI/40_PAGES/PAGE_DNA.md` for the archetype structure
- Reference `AI/30_COMPONENTS/` for component behavior
- Reference `AI/20_DESIGN/` for visual tokens

### Step 3: Implement
- Create page in `meterverse-ui/src/app/[domain]/page.tsx`
- Compose from existing UI primitives
- Connect to backend API using React Query hooks
- Implement all states: loading, empty, error, populated

### Step 4: Validate
- Build, type check, lint
- Playwright tests (all viewports)
- Console, network, accessibility, performance checks
- Visual comparison with legacy screenshots

### Step 5: Document
- Update `Frontend/migration/status.json` — mark page as migrated
- Update page status: `"status": "live"` in new frontend tracking

## 3. What to Reuse (from backend/legacy)

| Layer | Reuse Strategy |
|-------|---------------|
| API Client | ✅ Reuse — `src/lib/api/client.ts` pattern |
| Auth | ✅ Reuse — Backend JWT + RolesGuard |
| Permissions | ✅ Reuse — Backend CapabilityRegistry |
| Business Logic | ✅ Reuse — Backend services |
| Types | ✅ Reuse — `src/lib/types.ts` (with updates) |
| UI Components | 🔄 Rebuild — New Design System primitives |
| Hooks | 🔄 Rebuild — New React Query hooks |
| Layout | 🔄 Rebuild — New AppShell |
| Navigation | 🔄 Rebuild — New NavigationRegistry-driven sidebar |

## 4. Migration Priority

| Priority | Pages | Phase |
|----------|-------|-------|
| P0 | Login, Register, AppShell layout | Phase-03 |
| P1 | All 7 dashboards, Customers (3), Meters (5) | Phase-03/04 |
| P2 | Readings (3), Invoices (2), Payments (2), Balances, Consumption, Water Balance, Bill Cycle, Tariff Studio | Phase-04/05 |
| P3 | Reports (1), Alerts (1), Tickets (1), Support (1), SIM Cards (1), Sync Gateway (1), Upload Center (1), Settlements (1), Workplace (1) | Phase-06 |
| P4 | Admin Portal, Customer Portal, Settings | Phase-06 |
| P5 | Control Center, Design Studio, Sandbox | Phase-07 |

## 5. Rollback Strategy

If a migrated page fails quality gates:
1. Revert routing to legacy page
2. Document failure in `Frontend/migration/blockers/`
3. Fix in next sprint
4. Re-validate before re-deploying

## 6. Page Migration Checklist

- [ ] Legacy page identified and screenshots taken
- [ ] Page archetype determined
- [ ] Route defined in new frontend
- [ ] Page component created
- [ ] All states implemented (loading, empty, error, populated)
- [ ] Responsive at all 4 viewports
- [ ] RTL verified (Arabic layout)
- [ ] Keyboard navigation verified
- [ ] Build passes
- [ ] Type check passes
- [ ] Lint passes
- [ ] Playwright tests pass
- [ ] Console errors = 0
- [ ] Network failures = 0
- [ ] Accessibility passes
- [ ] Performance budget met
- [ ] Visual comparison with legacy UI acceptable
- [ ] status.json updated
