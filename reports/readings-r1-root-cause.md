# Readings Module — Phase R1 Root Cause Analysis

## B-01: ReadingsPage `mockProjects is not defined`

| Field | Value |
|-------|-------|
| **File** | `Meter/Frontend/src/components/readings/ReadingsPage.tsx` |
| **Line** | 118 (within `columns` array → `filters` → Project filter) |
| **Error** | `ReferenceError: mockProjects is not defined` |
| **Import at line 9** | `import { mockReadings } from '@/lib/mock-data';` |
| **Missing** | `mockProjects` is not in the import list |
| **Export location** | `Meter/Frontend/src/lib/mock-data.ts:20` — `export const mockProjects: Project[] = [` |
| **Fix** | Add `mockProjects` to the import: `import { mockReadings, mockProjects } from '@/lib/mock-data';` |

**Code path**: `ReadingsPage()` → `columns[3].options` (line 117-119) → `mockProjects.map(...)` crashes because identifier is never brought into scope.

---

## B-02: ReadingNewPage `useMemo is not defined`

| Field | Value |
|-------|-------|
| **File** | `Meter/Frontend/src/components/readings/ReadingNewPage.tsx` |
| **Line** | 53 (first usage of `useMemo(() => ..., [...])`) |
| **Error** | `ReferenceError: useMemo is not defined` |
| **Import at line 3** | `import { useState } from 'react';` |
| **Missing** | `useMemo` is not in the import list |
| **Fix** | Add `useMemo` to the React import: `import { useState, useMemo } from 'react';` |

**Secondary missing import** (masked by B-02 crash):
| Field | Value |
|-------|-------|
| **Line** | 45 (`mockReadings.filter(...)`) |
| **Import at line 4** | `import { mockProjects, mockMeters, mockCustomers, mockUnits } from '@/lib/mock-data';` |
| **Missing** | `mockReadings` is not in the import list |
| **Export location** | `Meter/Frontend/src/lib/mock-data.ts:142` |
| **Fix** | Add `mockReadings` to the same import line |

---

## Defect Classification

Both are **trivial missing-import bugs** — no logic or architectural defects. Neither was caught by bundler tree-shaking or TypeScript because:
- `mockProjects` is used in a runtime callback (`columns` definition → `filters`)
- `useMemo` is called in the component function body at render time
- TypeScript's `noUnusedLocals` / `noUnusedParameters` are likely disabled or lenient

Estimated fix time per bug: < 30 seconds.
