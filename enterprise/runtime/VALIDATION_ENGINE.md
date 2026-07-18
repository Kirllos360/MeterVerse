# MeterVerse Enterprise Validation Engine v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration & Autonomous Orchestration**

## Purpose
Validates every execution result across 12 domains. Gates enforce quality, security, architecture, and compliance standards autonomously. The validation engine is invoked by the orchestrator after each tool execution and at chain completion.

## 12 Validation Domains

| # | Domain | Tools | Severity | Pass Criteria |
|---|--------|-------|----------|--------------|
| 1 | Code Quality | TypeScript, ESLint, Prettier | BLOCKER | 0 errors, formatted |
| 2 | Architecture | DependencyCruiser, Madge, Knip, ts-prune | BLOCKER | 0 violations, 0 circular, 0 dead |
| 3 | Security | Semgrep, Snyk, Trivy, Checkov, Gitleaks, TruffleHog, npm audit | BLOCKER | 0 high/critical, 0 secrets |
| 4 | Testing | Playwright, k6, Artillery, Jest | BLOCKER | 100% pass, coverage >= 80% |
| 5 | API Contract | Spectral, Redocly, SwaggerCLI | BLOCKER | 0 errors, 0 warnings |
| 6 | Accessibility | Pa11y, Axe CLI, Lighthouse a11y | HIGH | score >= 90, 0 violations |
| 7 | Performance | Lighthouse, BundleWizard, k6 | HIGH | score >= 80, bundle < threshold |
| 8 | Documentation | TypeDoc, MkDocs, ADR | MEDIUM | 0 errors, buildable |
| 9 | Database | Prisma validate, migration check | BLOCKER | validate pass, no drift |
| 10 | Dependency | Snyk, npm audit, Madge circular | HIGH | 0 high/critical, 0 circular |
| 11 | Visualization | Graphviz, MermaidCLI, PlantUML | MEDIUM | diagrams generate without error |
| 12 | Enterprise | ALL domains combined | BLOCKER | overall >= 80, all BLOCKERs pass |

## Validation Pipeline

```
Tool Execution Output
  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 1. DOMAIN ROUTER                                     │
│    Map tool → validation domain(s)                   │
│    Load domain rules and thresholds                  │
└─────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 2. GATE EXECUTOR                                     │
│    For each domain gate:                             │
│    a. Parse tool output for pass/fail signals        │
│    b. Check against domain thresholds                │
│    c. Classify result: PASS / FAIL / WARN / SKIP    │
└─────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 3. SEVERITY EVALUATOR                                │
│    FAIL + BLOCKER → STOP execution                   │
│    FAIL + HIGH → WARN, continue, flag in report     │
│    FAIL + MEDIUM → WARN, continue                   │
│    All PASS → continue                               │
└─────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 4. RESULT AGGREGATOR                                 │
│    Merge all domain results                          │
│    Calculate pass rate per domain + overall          │
│    Generate validation report                        │
└─────────────────────────────────────────────────────┘
  │
  ▼
OUTPUT: ValidationReport JSON
```

## Domain Gate Definitions

### 1. Code Quality Gate
```
severity: BLOCKER
tools:
  - TypeScript: "npx tsc --noEmit" → exit 0 = PASS, exit != 0 = FAIL
  - ESLint: "eslint . --ext .ts,.tsx" → 0 errors = PASS, >0 errors = FAIL
  - Prettier: "prettier --check ." → formatted = PASS, unformatted = WARN

pass criteria: TypeScript PASS && ESLint PASS
blocker: TypeScript FAIL || ESLint FAIL
```

### 2. Architecture Gate
```
severity: BLOCKER
tools:
  - DependencyCruiser: "depcruise src --output-type err" → 0 violations = PASS
  - Madge: "madge --circular src/index.ts" → 0 circular = PASS, >0 = FAIL
  - Knip: "knip" → 0 dead exports = PASS, >0 = WARN
  - ts-prune: "ts-prune" → 0 unused = PASS, >0 = WARN

pass criteria: DependencyCruiser PASS && Madge PASS
blocker: DependencyCruiser FAIL || Madge FAIL
```

### 3. Security Gate
```
severity: BLOCKER
tools:
  - Semgrep: "semgrep --config=auto ." → 0 findings = PASS, >0 high/critical = FAIL
  - Snyk: "snyk test" → 0 high/critical = PASS, >0 = FAIL
  - Trivy: "trivy fs --severity CRITICAL,HIGH ." → 0 critical/high = PASS
  - Checkov: "checkov -d ." → 0 failed = PASS, >0 high = FAIL
  - Gitleaks: "gitleaks detect" → 0 secrets = PASS, >0 = FAIL
  - TruffleHog: "trufflehog filesystem . --only-verified" → 0 secrets = PASS
  - npm audit: "npm audit" → 0 critical/high = PASS, >0 = FAIL

pass criteria: ALL tools PASS
blocker: ANY tool FAIL (high/critical finding)
```

### 4. Testing Gate
```
severity: BLOCKER
tools:
  - Playwright: "npx playwright test" → all passing = PASS, any fail = FAIL
  - k6: "k6 run script.js" → 0 errors = PASS, >0 = FAIL
  - Jest: "npx jest --coverage" → all pass, coverage >= 80% = PASS
  - Artillery: "artillery run script.yml" → 0 errors = PASS

pass criteria: Playwright PASS (required), Jest PASS (required)
blocker: Playwright FAIL || Jest FAIL
```

### 5. API Contract Gate
```
severity: BLOCKER
tools:
  - Spectral: "npx spectral lint **/*.ts" → 0 errors = PASS
  - Redocly: "redocly lint" → 0 errors = PASS
  - SwaggerCLI: "swagger-cli validate" → valid = PASS

pass criteria: Spectral PASS (required)
blocker: Spectral FAIL
```

### 6. Accessibility Gate
```
severity: HIGH
tools:
  - Pa11y: "pa11y <url>" → score >= 90 = PASS
  - Axe CLI: "axe <url>" → 0 violations = PASS
  - Lighthouse a11y: "lighthouse <url> --category=accessibility" → score >= 90 = PASS

pass criteria: Pa11y PASS (required)
blocker: none (HIGH severity, not BLOCKER)
```

### 7. Performance Gate
```
severity: HIGH
tools:
  - Lighthouse: "lighthouse <url> --category=performance" → score >= 80 = PASS
  - BundleWizard: "bundle-wizard analyze" → bundle < threshold = PASS
  - k6: "k6 run perf-test.js" → p95 < 500ms = PASS

pass criteria: Lighthouse PASS (required)
blocker: none (HIGH severity)
```

### 8. Documentation Gate
```
severity: MEDIUM
tools:
  - TypeDoc: "npx typedoc" → 0 errors = PASS
  - MkDocs: "mkdocs build" → buildable = PASS
  - ADR: check ADR directory exists → exists = PASS

pass criteria: TypeDoc PASS && MkDocs PASS (recommended)
blocker: none (MEDIUM severity)
```

### 9. Database Gate
```
severity: BLOCKER
tools:
  - Prisma validate: "npx prisma validate" → valid = PASS
  - Prisma migrate status: "npx prisma migrate status" → no drift = PASS
  - Migration check: no unapplied migrations in prod context

pass criteria: Prisma validate PASS
blocker: Prisma validate FAIL || migration drift detected
```

### 10. Dependency Gate
```
severity: HIGH
tools:
  - Snyk: "snyk test" → 0 high/critical = PASS
  - npm audit: "npm audit" → 0 high/critical = PASS
  - Madge circular: "madge --circular src/index.ts" → 0 circular = PASS

pass criteria: Snyk PASS && Madge PASS
blocker: none (HIGH severity, but combined with Security Gate for BLOCKER)
```

### 11. Visualization Gate
```
severity: MEDIUM
tools:
  - Graphviz: "dot -Tpng graph.dot -o graph.png" → generates = PASS
  - MermaidCLI: "mmdc -i diagram.mmd -o diagram.png" → generates = PASS
  - PlantUML: "plantuml diagram.puml" → generates = PASS

pass criteria: At least one visualization tool generates output
blocker: none (MEDIUM severity)
```

### 12. Enterprise Gate (Meta-Gate)
```
severity: BLOCKER
composition:
  - Domains 1-5: ALL must PASS (BLOCKER severity)
  - Domains 6-7: must PASS (HIGH severity, strongly recommended)
  - Domains 8-11: PASS recommended (MEDIUM severity)
  - Certification: overall >= 80

pass criteria: ALL BLOCKER domains pass && overall certification >= 80
blocker: Any BLOCKER domain fails || overall certification < 80
```

## Validation Report Schema

```json
{
  "report_id": "VAL-20260714-001",
  "task_id": "TASK-20260714-001",
  "timestamp": "2026-07-14T05:00:00Z",
  "overall": {
    "status": "PASS",
    "pass_rate": 91.7,
    "domains_passed": 11,
    "domains_total": 12,
    "blockers": 0,
    "warnings": 1
  },
  "domains": [
    {
      "domain": "code_quality",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "TypeScript", "status": "PASS", "details": "0 errors" },
        { "tool": "ESLint", "status": "PASS", "details": "0 errors, 2 warnings" },
        { "tool": "Prettier", "status": "PASS", "details": "all formatted" }
      ]
    },
    {
      "domain": "architecture",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "DependencyCruiser", "status": "PASS", "details": "0 violations" },
        { "tool": "Madge", "status": "PASS", "details": "0 circular" },
        { "tool": "Knip", "status": "WARN", "details": "2 unused exports (non-critical)" },
        { "tool": "ts-prune", "status": "PASS", "details": "0 unused" }
      ]
    },
    {
      "domain": "security",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "Semgrep", "status": "PASS", "details": "0 findings" },
        { "tool": "Snyk", "status": "PASS", "details": "0 high, 2 medium" },
        { "tool": "Trivy", "status": "PASS", "details": "0 critical, 0 high" },
        { "tool": "Gitleaks", "status": "PASS", "details": "0 secrets" }
      ]
    },
    {
      "domain": "testing",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "Playwright", "status": "PASS", "details": "42/42 passed" },
        { "tool": "Jest", "status": "PASS", "details": "156/156 passed, 84% coverage" }
      ]
    },
    {
      "domain": "api_contract",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "Spectral", "status": "PASS", "details": "0 errors, 3 info" }
      ]
    },
    {
      "domain": "accessibility",
      "status": "PASS",
      "severity": "HIGH",
      "pass_rate": 100,
      "gates": [
        { "tool": "Pa11y", "status": "PASS", "details": "score 94" }
      ]
    },
    {
      "domain": "performance",
      "status": "PASS",
      "severity": "HIGH",
      "pass_rate": 100,
      "gates": [
        { "tool": "Lighthouse", "status": "PASS", "details": "score 87" }
      ]
    },
    {
      "domain": "documentation",
      "status": "WARN",
      "severity": "MEDIUM",
      "pass_rate": 66.7,
      "gates": [
        { "tool": "TypeDoc", "status": "PASS", "details": "0 errors" },
        { "tool": "MkDocs", "status": "FAIL", "details": "2 broken links (non-blocker)" },
        { "tool": "ADR", "status": "PASS", "details": "11 ADRs exist" }
      ]
    },
    {
      "domain": "database",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "Prisma validate", "status": "PASS", "details": "schema valid" }
      ]
    },
    {
      "domain": "dependency",
      "status": "PASS",
      "severity": "HIGH",
      "pass_rate": 100,
      "gates": [
        { "tool": "Snyk", "status": "PASS", "details": "0 high" },
        { "tool": "npm audit", "status": "PASS", "details": "0 high" },
        { "tool": "Madge", "status": "PASS", "details": "0 circular" }
      ]
    },
    {
      "domain": "visualization",
      "status": "PASS",
      "severity": "MEDIUM",
      "pass_rate": 100,
      "gates": [
        { "tool": "MermaidCLI", "status": "PASS", "details": "diagram generated" }
      ]
    },
    {
      "domain": "enterprise",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 91.7,
      "gates": [
        { "domain": "overall_certification", "status": "PASS", "details": "score 87.5 >= 80" }
      ]
    }
  ],
  "remediation": [
    {
      "domain": "documentation",
      "tool": "MkDocs",
      "issue": "2 broken links",
      "severity": "MEDIUM",
      "action": "Fix broken links in mkdocs.yml nav section"
    },
    {
      "domain": "architecture",
      "tool": "Knip",
      "issue": "2 unused exports",
      "severity": "WARN",
      "action": "Review and remove unused exports in src/utils/format.ts"
    }
  ]
}
```

## Integration Contract

### Input
```
tool_execution_results: [
  {
    tool: string,
    exit_code: number,
    stdout: string,
    stderr: string,
    duration: number
  }
]
chain_id: string (optional — to select domain set)
```

### Output
```
ValidationReport: JSON object following Validation Report Schema
```

### Error Handling
| Condition | Behavior |
|-----------|----------|
| Tool not found in any domain | SKIP (log warning, continue) |
| Gate command not available | WARN (log, continue, mark as WARN) |
| Domain definition missing | SKIP domain (log error, continue) |
| All domains skip | Return minimal report with overall FAIL |
| Validation timeout | Return partial report with FAIL on timed-out domains |

## Gate Execution Commands

Each validation gate maps to a concrete command string that the orchestrator runs:

```json
{
  "TypeScript": "npx tsc --noEmit",
  "ESLint": "eslint . --ext .ts,.tsx",
  "Prettier": "prettier --check .",
  "DependencyCruiser": "depcruise src --output-type err",
  "Madge": "madge --circular src/index.ts",
  "Knip": "knip",
  "ts-prune": "ts-prune",
  "Semgrep": "semgrep --config=auto .",
  "Snyk": "snyk test",
  "Trivy": "trivy fs --severity CRITICAL,HIGH .",
  "Checkov": "checkov -d .",
  "Gitleaks": "gitleaks detect",
  "TruffleHog": "trufflehog filesystem . --only-verified",
  "npm audit": "npm audit",
  "Playwright": "npx playwright test",
  "Jest": "npx jest --coverage",
  "k6": "k6 run load-test.js",
  "Artillery": "artillery run test.yml",
  "Spectral": "npx spectral lint **/*.ts",
  "Pa11y": "pa11y http://localhost:3030",
  "Lighthouse": "npx lighthouse http://localhost:3030 --output=html",
  "TypeDoc": "npx typedoc",
  "MkDocs": "mkdocs build",
  "Prisma validate": "npx prisma validate",
  "Graphviz": "dot -V",
  "MermaidCLI": "mmdc --version",
  "PlantUML": "plantuml -version"
}
```
