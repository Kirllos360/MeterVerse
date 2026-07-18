# MeterVerse Toolchain Profile
**Version:** 1.0.0  
**Generated:** 2026-07-12  
**Scope:** All MeterVerse development tasks

---

## 1. Mandatory Tools

Every tool listed below is **required**. No task is complete unless its associated tool has passed.

### Tier 1 — Per-Task (Always)
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **TypeScript** | Every code change | `npx tsc --noEmit` | Block PR |
| **ESLint** | Every code change | `eslint . --ext .ts,.tsx` | Block PR |
| **Dependency Cruiser** | Every code change | `depcruise src --output-type err` | Block PR |
| **Madge** | Every code change | `madge --circular src/index.ts` | Block PR |
| **Playwright** | Every UI change | `npx playwright test` | Block PR |

### Tier 2 — Per-Change (Code/Dependency)
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **Prisma validate** | Schema changes | `npx prisma validate` | Block PR |
| **npm audit** | Dependency changes | `npm audit --audit-level=high` | Warning + report |
| **Snyk** | Dependency changes | `snyk test` | Warning + report |
| **Semgrep** | Code changes | `semgrep --config=auto . --metrics=off` | Warning + report |
| **Spectral** | API changes | `npx spectral lint **/*.ts` | Warning + report |
| **SpecKit** | Spec changes | `npx speckit validate` | Warning + report |
| **Graphify** | Architecture changes | `node .opencode/plugins/graphify.js` | Report only |

### Tier 3 — Pre-Deployment
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **Lighthouse** | Before deploy | `npx lighthouse http://localhost:3030 --output=html` | Warning + report |
| **axe** | Before deploy | `axe http://localhost:3030` | Block deploy |
| **Trivy** | Before deploy | `trivy fs --severity CRITICAL,HIGH .` | Block deploy |
| **k6** | Before deploy | `k6 run tests/load/*.js` | Warning + report |

### Tier 4 — Weekly / On-Demand
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **TruffleHog** | Weekly | `trufflehog filesystem . --only-verified` | Block if secrets found |
| **njsscan** | Weekly | `njsscan .` | Warning + report |
| **OpenAPI Generator** | API changes | `openapi-generator-cli generate -i spec.yaml -g typescript` | Report only |
| **Redocly** | API spec review | `redocly lint spec.yaml` | Warning + report |

---

## 2. Tool Execution Flow

```
[CODE CHANGE]
    │
    ├── Pre-Task ─────────────────── depcruise src (dependency health check)
    │
    ├── Development ──────────────── tsc --noEmit + eslint + madge
    │
    ├── Testing ──────────────────── playwright test + prisma validate
    │
    ├── Security ─────────────────── semgrep + trivy + snyk + trufflehog
    │                                  │
    │                                  └── Reports → D:\meter\reports\
    │
    ├── Quality Gate ─────────────── All Tier 1 & 2 passed?
    │                                  │
    │                                  ├── YES → Continue to deploy
    │                                  └── NO  → Block + generate report
    │
    ├── Pre-Deploy ───────────────── lighthouse + axe + k6
    │
    └── Complete ─────────────────── All reports archived
```

---

## 3. Failure Reporting

### Report Directory
```
D:\meter\reports\
├── eslint-{date}.txt
├── tsc-{date}.txt
├── depcruise-{date}.txt
├── madge-{date}.txt
├── semgrep-{date}.txt
├── trivy-{date}.{format}
├── snyk-{date}.txt
├── spectral-{date}.txt
├── lighthouse-{date}.html
├── axe-{date}.txt
├── trufflehog-{date}.txt
└── playwright-{date}.xml
```

### Report Format
Every report contains:
1. **Tool name and version**
2. **Timestamp**
3. **Command executed**
4. **Exit code**
5. **Full output**
6. **Summary / Pass-Fail status**

### Failure Severity Levels
| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 BLOCK | Task cannot proceed | Fix before continuing |
| 🟡 WARN | Issue found, non-blocking | Fix before PR |
| 🔵 INFO | Observation only | Log for review |

---

## 4. Quality Gates

### Gate 1 — TypeScript Compilation
```
npx tsc --noEmit
→ Zero errors = PASS
→ Any errors = BLOCK
```

### Gate 2 — ESLint
```
eslint . --ext .ts,.tsx
→ Zero errors = PASS
→ Any errors = BLOCK
→ Warnings = WARN
```

### Gate 3 — Dependency Integrity
```
depcruise src --output-type err
→ No violations = PASS
→ Any violation = BLOCK
```

### Gate 4 — Circular Dependencies
```
madge --circular src/index.ts
→ No circular deps = PASS
→ Any circular = BLOCK
```

### Gate 5 — Tests
```
npx playwright test
→ All passing = PASS
→ Any failure = BLOCK
```

### Gate 6 — Security
```
semgrep --config=auto . --metrics=off
trivy fs --severity CRITICAL,HIGH .
snyk test
→ No critical/high findings = PASS
→ CRITICAL findings = BLOCK
→ HIGH findings = WARN
```

### Gate 7 — npm Audit
```
npm audit --audit-level=high
→ No high/critical = PASS
→ Found = WARN
```

### Gate 8 — Secrets
```
trufflehog filesystem . --only-verified
→ No secrets = PASS
→ Secrets found = BLOCK
```

---

## 5. PR Completion Checklist

```
Before any PR is merged:

[Gate 1] TypeScript compilation ............_/_
[Gate 2] ESLint ..........................._/_
[Gate 3] Dependency cruise ................_/_
[Gate 4] Madge circular check ............._/_
[Gate 5] Tests passing ...................._/_
[Gate 6] Security (semgrep/trivy/snyk) ...._/_
[Gate 7] npm audit ........................_/_
[Gate 8] Secrets (trufflehog) .............._/_
[Gate 9] API lint (spectral) .............._/_
[Gate 10] Performance (lighthouse/axe) ...._/_
```

All 10 gates must pass. Any BLOCK failure must be resolved before the PR is considered complete.

---

## 6. Toolchain Registration

| Platform | Location | Tools Registered |
|----------|----------|------------------|
| **OpenCode** | `.opencode/opencode.json` | 8 MCPs (notion, odoo, playwright, context7, figma, serena, chrome-devtools, codebase-memory) |
| **OpenCode Rules** | `.opencode/rules/toolchain.mdc` | All mandatory tools with quality gates |
| **Claude Code** | `AGENTS.md` | All tiers, quality gates, report generation |
| **CI/CD** | `.github/workflows/ci.yml` | 5 jobs (backend, frontend, quality-gate, security, secret-scan) |
| **VS Code** | `.vscode/settings.json` | ESLint, TypeScript, Prettier, auto-format |
| **VS Code Tasks** | `.vscode/tasks.json` | Dependency check, security scan, full validation, performance audit |
| **PowerShell** | `$PROFILE` | Toolchain check function, PATH extensions, aliases |
| **Windows PATH** | System + User env | All tool binaries added |
| **Playwright** | `npx @playwright/mcp` | Registered in OpenCode |
| **Graphify** | `.opencode/plugins/graphify.js` | Registered as OpenCode plugin |
