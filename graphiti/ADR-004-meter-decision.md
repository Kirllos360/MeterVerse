# ADR-004: Meter/ Parallel Codebase Decision

**Status:** Accepted
**Date:** 2026-07-23

## Context
The Meter/ directory contains 267,983 files from a parallel codebase version.

## Decision
Archive the Meter/ directory to docs/archive/Meter/ for reference.
Do not merge — the active codebase at backend/ and Frontend/ is the source of truth.

## Consequences
- Reduced repository size by ~1.5GB
- Clear single source of truth
- Historical code preserved
