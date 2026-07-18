# MeterVerse Quality Gates
**Version 1.0.0 | Generated 2026-07-12 | Phase 02**

## Gate Table

| # | Gate | Command | Severity | Threshold |
|---|------|---------|----------|-----------|
| 1 | Architecture | `depcruise src --output-type err` | 🔴 Blocker | Zero violations |
| 2 | Circular Dependencies | `madge --circular src/index.ts` | 🔴 Blocker | Zero cycles |
| 3 | Dead Code | `knip` and `ts-prune` | 🟡 Warning | Zero dead exports |
| 4 | Bundle Size | `bundle-wizard` | 🟡 Warning | Under threshold |
| 5 | TypeScript | `npx tsc --noEmit` | 🔴 Blocker | Zero errors |
| 6 | ESLint | `eslint . --ext .ts,.tsx` | 🔴 Blocker | Zero errors |
| 7 | Prettier | `prettier --check .` | 🟡 Warning | Zero diffs |
| 8 | Tests | `npx playwright test` | 🔴 Blocker | All passing |
| 9 | Coverage | For unit tests | 🟡 Warning | ≥ 80% |
| 10 | Accessibility | `pa11y`, `lighthouse`, `axe` | 🟠 High | Score ≥ 90 |
| 11 | Performance | `lighthouse` | 🟡 Warning | Score ≥ 80 |
| 12 | API Contract | `npx spectral lint` | 🟠 High | Zero errors |
| 13 | Security SAST | `semgrep --config=auto .` | 🔴 Blocker | Zero critical |
| 14 | Dependency Vuln | `snyk test` | 🔴 Blocker | Zero high |
| 15 | Container Vuln | `trivy fs --severity CRITICAL,HIGH .` | 🟠 High | Zero |
| 16 | Secret Leak | `trufflehog filesystem . --only-verified` | 🔴 Blocker | Zero |
| 17 | npm audit | `npm audit` | 🟠 High | Zero high/critical |
| 18 | Documentation | `typedoc` | 🟢 Info | No broken refs |
| 19 | ADR | `log4brains` ADR check | 🟢 Info | ADR exists per change |
| 20 | Knowledge Graph | Graphly export | 🟢 Info | Valid JSON |
| 21 | Spec Validation | Requirements ↔ Implementation | 🟡 Warning | All acceptance criteria met |
| 22 | Runtime Validation | Runtime profile match | 🟡 Warning | All versions match lock |

## Gate Execution Order
```
Architecture → Circular Deps → Dead Code → Bundle Size → TypeScript → ESLint
→ Prettier → Tests → Coverage → Accessibility → Performance → API Contract
→ SAST → Dep Vulns → Container Vulns → Secrets → npm audit → Docs → ADR
→ Knowledge Graph → Spec Validation → Runtime Validation
```

## Severity Legend
- 🔴 **Blocker:** Pipeline halts, cannot merge
- 🟠 **High:** Must fix before deployment
- 🟡 **Warning:** Should fix, logged as tech debt
- 🟢 **Info:** Informational, no action required

## Automation
All gates are executable via VS Code tasks (`Ctrl+Shift+P → Tasks: Run Task`) and GitHub Actions (`.github/workflows/ci.yml`).
