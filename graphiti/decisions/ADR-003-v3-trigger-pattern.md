# ADR-003: V3 Database Trigger Pattern

**Status**: Accepted  
**Date**: 2026-07-19  
**Author**: MeterVerse Architecture Team

## Context

The "combined" energy channels (Import + Export) require database triggers to calculate combined values. V2 triggers had issues with staggered data arrival and used outdated patterns.

## Decision

V3 triggers use:
1. **MPRTFk-based linking** — Join via MeasPointResType, not ChannelFk
2. **Subqueries with ISNULL(..., 0)** — Handle staggered arrival gracefully
3. **NOT EXISTS guard** — Prevent duplicate combined rows
4. **No DeviceSumConfig** — Filter by LP2 meters instead
5. **Status = 1** — Combined rows marked as calculated

## Consequences

- ✅ Works with October, New Cairo, and SODIC schemas
- ✅ No data loss when Import and Export arrive at different times
- ✅ Re-runnable without duplicates
- ✅ Compatible with both Result and ResultM tables
