# ADR-002: Design Token System

**Status**: Accepted  
**Date**: 2026-07-19  
**Author**: MeterVerse Architecture Team

## Context

The original codebase had 50+ hardcoded `#00BFA5` instances and inline rgba values throughout components. This made theming impossible and dark mode required CSS hacks with `!important`.

## Decision

Replace all hardcoded color values with CSS custom properties:

1. **Brand colors** → `var(--brand-primary)`, `var(--brand-primary-rgb)`
2. **Theme colors** → `var(--background)`, `var(--foreground)`, `var(--card)`
3. **Surface tokens** → `var(--surface-base)`, `var(--surface-raised)`, `var(--surface-sunken)`
4. **Text tokens** → `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
5. **Status tokens** → `var(--status-success)`, `var(--status-error)`, `var(--status-warning)`
6. **RGB component vars** → For use with `rgba()` (e.g., `--brand-primary-rgb: 0, 191, 165`)

## Consequences

- ✅ Dark mode works without CSS hacks
- ✅ Any theme colors can be changed in one place
- ✅ WCAG compliance achieved with proper contrast ratios
- ✅ Removed 60+ lines of `!important` CSS overrides
