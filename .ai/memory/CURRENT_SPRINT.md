# MeterVerse - Current Sprint

## P13.7 Solar Vertical Chain Completion (2026-08-17)

**Goal:** complete remaining internal gates (G04 real data link + PDF route/API + reading-boundary tests).  
**Status:** COMPLETE (internal) — G01/G07 remain external; gate matrix in planning/063_SOLAR_VERTICAL_GATE_MATRIX.md

| Item | Result |
|------|--------|
| G04 | meter 52051449 → customer linked (UPDATE) + active MeterAssignment 2021-01-01; psql + API verified |
| PDF route (G16) | +5 API tests (200/404/401), engine mocked (concern separation) |
| Ingestion boundary (G08) | +3 API tests (negative / non-numeric / future-timestamp → 400) |
| Root cause | UTF-8 BOM broke vitest ESM loader → stripped; rule: no Set-Content -Encoding UTF8 on ESM tests |
| Tests | Suite 439 (421/18) |
| Verified | Graph 12/0/0, SpecKit 100%, FE tsc 0, live 36.10 compute |
| External blocker | G01/G07: real register source |
| Next | resolve G01 → real invoice+PDF vertical; or P12.2-B |


