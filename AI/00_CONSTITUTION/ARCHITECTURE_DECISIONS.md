# MeterVerse Enterprise — Architecture Decision Records

**Owner:** Chief Enterprise AI Architect  
**Last Updated:** 2026-07-04  

---

## ADR-001: Two Frontend Strategy

**Decision:** Legacy frontend is frozen READ ONLY. New frontend built from scratch in `Frontend/meterverse-ui/`.
**Rationale:** The legacy frontend accumulated 52 pages with inconsistent patterns, hardcoded navigation, and divergent visual themes. A clean rebuild was faster and more maintainable than incremental refactoring.
**Consequence:** Both codebases coexist temporarily. Phase-08 will decommission legacy.
**Date:** 2026-07-03

## ADR-002: Design DNA as Sole Authority

**Decision:** No component may define its own colors, spacing, typography, animation, or elevation. All visual properties must reference tokens defined in Design DNA.
**Rationale:** Eliminates the inconsistency that plagued the legacy frontend (5 different KPI card variants, divergent color systems).
**Source:** `Frontend/experience-dna/design-dna.md`
**Date:** 2026-07-03

## ADR-003: Metadata-Driven Over Hardcoded

**Decision:** Prefer registry-based configuration over hardcoded switches for navigation, permissions, and UI composition.
**Rationale:** The backend already has NavigationRegistry, CapabilityRegistry, OperationRegistry, and UI Manifest Registry. The frontend should consume these rather than duplicate hardcoded logic.
**Source:** `Meter/backend/src/runtime-capabilities/`
**Date:** 2026-07-04

## ADR-004: Semantic Token System Over Raw Values

**Decision:** Use semantic CSS custom properties (e.g., `--color-text-primary`, `--color-surface-base`) instead of raw hex/hsl values in components.
**Rationale:** Enables theme switching (light/dark/gray/adaptive) without component changes. The legacy frontend suffered from inconsistent colors across 207 files.
**Source:** `Frontend/meterverse-ui/src/app/globals.css`, `Frontend/experience-dna/design-dna.md`
**Date:** 2026-07-03

## ADR-005: Runtime Consumption, Not Duplication

**Decision:** Never rebuild runtime/gateway/auth/permissions/business logic. The frontend consumes these via API.
**Rationale:** The backend runtime (55 modules) is mature and certified. Rebuilding would duplicate thousands of lines of tested code and introduce regression risk.
**Source:** `Meter/backend/src/`
**Date:** 2026-07-04

## ADR-006: RTL-First Arabic Support

**Decision:** Design for Arabic (RTL) as the primary language with English (LTR) as secondary. Layouts must work in both directions.
**Rationale:** The platform serves Egyptian communities where Arabic is the operational language. The legacy frontend already defaults to Arabic.
**Source:** `Meter/Frontend/src/lib/i18n/translations.ts`, `Frontend/experience-dna/design-dna.md`
**Date:** 2026-07-04

## ADR-007: Process-Oriented Over Page-Oriented

**Decision:** Design workflows and user journeys, not isolated pages. Every page is part of a business process.
**Rationale:** Utility management is workflow-driven (meter lifecycle, billing cycle, reading review). Pages should guide users through these processes, not sit in isolation.
**Date:** 2026-07-04

## ADR-008: 55-Module Backend as Single Source of Truth

**Decision:** The backend's 55 modules define the business domain model. The frontend derives its understanding from the backend API, not from duplicated type definitions.
**Rationale:** Prevents drift between frontend types and backend reality. The legacy frontend had its own type definitions that sometimes diverged.
**Source:** `Meter/backend/src/app.module.ts`
**Date:** 2026-07-04
