# MeterVerse Enterprise — Architecture Handoff Document

**Purpose:** Provides complete context for any AI or human continuing work on the MeterVerse frontend after Wave-06 Phase-05.

---

## 1. Reading Order for New Agents

Start here, then follow this sequence:
1. `AI/00_CONSTITUTION/PROJECT_STATE.md` — Current state
2. `AI/00_CONSTITUTION/ROADMAP.md` — What comes next
3. `AI/00_CONSTITUTION/ARCHITECTURE_DECISIONS.md` — Why decisions were made
4. `PRODUCT_PHILOSOPHY.md` — The "why" of MeterVerse
5. `AI/10_EXPERIENCE/` — How users experience the platform
6. `AI/20_DESIGN/` — Visual language and tokens
7. `AI/30_COMPONENTS/` — Component behavior and rules
8. `AI/40_PAGES/` — Page archetypes
9. `AI/50_IMPLEMENTATION/` — How to build correctly

## 2. Critical Rules (Never Break)

1. **Legacy frontend (`Meter/Frontend/`) is READ ONLY** — never modify, temporary reference
2. **All new work goes in `Frontend/meterverse-ui/`**
3. **Design DNA is sole authority** — no component defines its own colors, spacing, typography
4. **Never duplicate** runtime/gateway/auth/permissions/business logic — only rebuild visual layer
5. **Every component inherits** from CSS custom properties — no hardcoded values
6. **Metadata-driven UI** — prefer registry configuration over hardcoded switches
7. **No hardcoded permissions or navigation** — use CapabilityRegistry and NavigationRegistry
8. **Run quality gates** before marking any phase complete (build, typecheck, lint, tests)
9. **Do not self-certify** — verification must be independent

## 3. Key File Locations

| Need | Path |
|------|------|
| All design tokens | `Frontend/meterverse-ui/src/app/globals.css` |
| Design DNA (full) | `Frontend/experience-dna/design-dna.md` |
| Experience DNA (full) | `Frontend/experience-dna/experience-dna.md` |
| Migration status | `Frontend/migration/status.json` |
| Migration roadmap | `Frontend/migration/migration-roadmap.md` |
| Legacy inventory | `Frontend/legacy-ui/inventory-report.md` |
| Architecture DNA | `AI/20_DESIGN/` |
| Component DNA | `AI/30_COMPONENTS/` |
| Page DNA | `AI/40_PAGES/` |
| Implementation rules | `AI/50_IMPLEMENTATION/` |
| Product philosophy | `PRODUCT_PHILOSOPHY.md` |
| AI governance | `memory files/EAOS.md` |
| Session memory | `memory files/HANDSHAKE.md` |
| Start point | `Frontend/archive/start-point.md` |

## 4. Current State Snapshot

- **Enterprise phase:** Wave-06 (Design DNA & Frontend Rebuild)
- **Frontend phase:** Wave-07 Phase-01 ✅ → Phase-02 ⏳
- **Backend:** Wave-05 done, pending IV
- **Runtime:** Port 6262 operational, 11 screens, 20 endpoints
- **Frontend new:** Foundation page only, quality-gate passed
- **Design authority:** `Frontend/experience-dna/` ratified v1.0.0

## 5. Next Implementation Action

Begin Frontend Phase-02: Create `src/lib/design-tokens/`, `src/components/ui/`, `src/components/layout/` in `Frontend/meterverse-ui/`. Build color token system, typography system, spacing, then UI primitives (Button, Input, Card, etc.), then layout shell (AppShell, Sidebar, Topbar).
