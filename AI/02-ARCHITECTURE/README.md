# 02-ARCHITECTURE — Architecture Documents

## Purpose

Index of architecture documents. The single source of truth for all architecture decisions is SYSTEM_DNA_DRAFT.md.

## Source of Truth

| Document | Location | Covers |
|----------|----------|--------|
| SYSTEM_DNA_DRAFT.md | `../../SYSTEM_DNA_DRAFT.md` | Full architecture (787 lines) |

## Related Documents

- `../../Meter/AGENTS.md` — Agent instructions, architecture constraints
- `../../Meter/backend/src/` — Implementation (43 subdirectories)
- `../../Meter/backend/prisma/schema.prisma` — Database schema (3223 lines)
- `../../docs/PRODUCTION_DEPLOYMENT_GUIDE.md` — Deployment
- `../../docs/DISASTER_RECOVERY_GUIDE.md` — DR plan

## Architecture Philosophy

Per EAOS.md Chapter 2.3 (Dependency Graph First): Before any architecture change, identify all dependencies, coupling levels, and shared services. Use `STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md` Phase 2 (Dependency Graph) as reference.
