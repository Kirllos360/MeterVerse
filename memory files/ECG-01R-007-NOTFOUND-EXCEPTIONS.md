# ECG-01R-007 — Replace 16 NotFoundException with PlatformException

**Platform:** Error Platform (Phase 6)  
**Priority:** P1  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Replace all business-validation `NotFoundException` instances with `PlatformException(ErrorCodes.RES_NOT_FOUND)`.

## Scope

Replace `throw new NotFoundException(msg)` with `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, msg)` in these locations:

### `src/customers/customers.service.ts` (6 instances)
| Line | Current | Replace with |
|------|---------|-------------|
| 61 | `throw new NotFoundException(...)` | `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, ...)` |
| 144 | Same pattern | Same |
| 154 | Same pattern | Same |
| 230 | Same pattern | Same |
| 233 | Same pattern | Same |
| 264 | Same pattern | Same |

### `src/meters/meters.service.ts` (4 instances)
| Line | Current | Replace with |
|------|---------|-------------|
| 77 | `throw new NotFoundException(...)` | `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, ...)` |
| 169 | Same pattern | Same |
| 221 | Same pattern | Same |
| 291 | Same pattern | Same |

### `src/projects/locations/locations.service.ts` (2 instances)
| Line | Current | Replace with |
|------|---------|-------------|
| 111 | `throw new NotFoundException(...)` | `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, ...)` |
| 164 | Same pattern | Same |

### `src/sim-cards/sim-cards.service.ts` (2 instances)
| Line | Current | Replace with |
|------|---------|-------------|
| 57 | `throw new NotFoundException(...)` | `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, ...)` |
| 98 | Same pattern | Same |

### `src/payments/payments.service.ts` (2 instances)
| Line | Current | Replace with |
|------|---------|-------------|
| 44 | `throw new NotFoundException(...)` | `throw new PlatformException(ErrorCodes.RES_NOT_FOUND, ...)` |
| 64 | Same pattern | Same |

**Do NOT modify** the 9 genuine 404 instances (direct `findUnique` checks without validators).

## Verification

- `npx tsc --noEmit` — 0 errors
- All occurrence matches produce `PlatformException`
- Tests expecting `NotFoundException` are updated to expect `PlatformException`
- `npx jest` — affected tests pass
