# MeterVerse Toolchain Profile
**Version:** 1.0.0  
**Generated:** 2026-07-12  
**Scope:** All MeterVerse development tasks

---

## 1. Mandatory Tools

Every tool listed below is **required**. No task is complete unless its associated tool has passed.

### Tier 1 â€” Per-Task (Always)
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **TypeScript** | Every code change | `npx tsc --noEmit` | Block PR |
| **ESLint** | Every code change | `eslint . --ext .ts,.tsx` | Block PR |
| **Dependency Cruiser** | Every code change | `depcruise src --output-type err` | Block PR |
| **Madge** | Every code change | `madge --circular src/index.ts` | Block PR |
| **Playwright** | Every UI change | `npx playwright test` | Block PR |

### Tier 2 â€” Per-Change (Code/Dependency)
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **Prisma validate** | Schema changes | `npx prisma validate` | Block PR |
| **npm audit** | Dependency changes | `npm audit --audit-level=high` | Warning + report |
| **Snyk** | Dependency changes | `snyk test` | Warning + report |
| **Semgrep** | Code changes | `semgrep --config=auto . --metrics=off` | Warning + report |
| **Spectral** | API changes | `npx spectral lint **/*.ts` | Warning + report |
| **SpecKit** | Spec changes | `npx speckit validate` | Warning + report |
| **Graphify** | Architecture changes | `node .opencode/plugins/graphify.js` | Report only |

### Tier 3 â€” Pre-Deployment
| Tool | Trigger | Command | Failure Action |
|------|---------|---------|---------------|
| **Lighthouse** | Before deploy | `npx lighthouse http://localhost:3535 --output=html` | Warning + report |
| **axe** | Before deploy | `axe http://localhost:3535` | Block deploy |
| **Trivy** | Before deploy | `trivy fs --severity CRITICAL,HIGH .` | Block deploy |
| **k6** | Before deploy | `k6 run tests/load/*.js` | Warning + report |

### Tier 4 â€” Weekly / On-Demand
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
    â”‚
    â”œâ”€â”€ Pre-Task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ depcruise src (dependency health check)
    â”‚
    â”œâ”€â”€ Development â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ tsc --noEmit + eslint + madge
    â”‚
    â”œâ”€â”€ Testing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ playwright test + prisma validate
    â”‚
    â”œâ”€â”€ Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ semgrep + trivy + snyk + trufflehog
    â”‚                                  â”‚
    â”‚                                  â””â”€â”€ Reports â†’ D:\meter\reports\
    â”‚
    â”œâ”€â”€ Quality Gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ All Tier 1 & 2 passed?
    â”‚                                  â”‚
    â”‚                                  â”œâ”€â”€ YES â†’ Continue to deploy
    â”‚                                  â””â”€â”€ NO  â†’ Block + generate report
    â”‚
    â”œâ”€â”€ Pre-Deploy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ lighthouse + axe + k6
    â”‚
    â””â”€â”€ Complete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ All reports archived
```

---

## 3. Failure Reporting

### Report Directory
```
D:\meter\reports\
â”œâ”€â”€ eslint-{date}.txt
â”œâ”€â”€ tsc-{date}.txt
â”œâ”€â”€ depcruise-{date}.txt
â”œâ”€â”€ madge-{date}.txt
â”œâ”€â”€ semgrep-{date}.txt
â”œâ”€â”€ trivy-{date}.{format}
â”œâ”€â”€ snyk-{date}.txt
â”œâ”€â”€ spectral-{date}.txt
â”œâ”€â”€ lighthouse-{date}.html
â”œâ”€â”€ axe-{date}.txt
â”œâ”€â”€ trufflehog-{date}.txt
â””â”€â”€ playwright-{date}.xml
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
| ðŸ”´ BLOCK | Task cannot proceed | Fix before continuing |
| ðŸŸ¡ WARN | Issue found, non-blocking | Fix before PR |
| ðŸ”µ INFO | Observation only | Log for review |

---

## 4. Quality Gates

### Gate 1 â€” TypeScript Compilation
```
npx tsc --noEmit
â†’ Zero errors = PASS
â†’ Any errors = BLOCK
```

### Gate 2 â€” ESLint
```
eslint . --ext .ts,.tsx
â†’ Zero errors = PASS
â†’ Any errors = BLOCK
â†’ Warnings = WARN
```

### Gate 3 â€” Dependency Integrity
```
depcruise src --output-type err
â†’ No violations = PASS
â†’ Any violation = BLOCK
```

### Gate 4 â€” Circular Dependencies
```
madge --circular src/index.ts
â†’ No circular deps = PASS
â†’ Any circular = BLOCK
```

### Gate 5 â€” Tests
```
npx playwright test
â†’ All passing = PASS
â†’ Any failure = BLOCK
```

### Gate 6 â€” Security
```
semgrep --config=auto . --metrics=off
trivy fs --severity CRITICAL,HIGH .
snyk test
â†’ No critical/high findings = PASS
â†’ CRITICAL findings = BLOCK
â†’ HIGH findings = WARN
```

### Gate 7 â€” npm Audit
```
npm audit --audit-level=high
â†’ No high/critical = PASS
â†’ Found = WARN
```

### Gate 8 â€” Secrets
```
trufflehog filesystem . --only-verified
â†’ No secrets = PASS
â†’ Secrets found = BLOCK
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
