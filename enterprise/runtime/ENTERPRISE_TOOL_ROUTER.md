# MeterVerse Enterprise Tool Router v3
**Generated:** 2026-07-14 | **Phase 03 — AI Operating System Bootstrap**

## Architecture
```
User Task → Router Classifier → Decision Tree → Tool Chain → Validation → Certification
```

## Classification Rules
Tasks are classified by keyword matching against their description:

| Keyword Match | Task Type | Decision Tree |
|--------------|-----------|---------------|
| `frontend`, `ui`, `component`, `page`, `style`, `css`, `storybook` | FRONTEND | Tree A |
| `backend`, `api`, `endpoint`, `service`, `controller`, `route` | BACKEND | Tree B |
| `database`, `schema`, `prisma`, `migration`, `model`, `query` | DATABASE | Tree C |
| `architecture`, `structure`, `refactor`, `module`, `dependency` | ARCHITECTURE | Tree D |
| `security`, `vuln`, `audit`, `scan`, `secret`, `auth` | SECURITY | Tree E |
| `test`, `e2e`, `playwright`, `coverage`, `assert` | TESTING | Tree F |
| `doc`, `readme`, `api-doc`, `adr`, `changelog` | DOCUMENTATION | Tree G |
| `design`, `figma`, `token`, `theme`, `a11y`, `accessibility` | DESIGN | Tree H |
| `release`, `deploy`, `ci`, `cd`, `docker`, `infra` | DEVOPS | Tree I |
| `performance`, `bundle`, `load`, `lighthouse`, `k6` | PERFORMANCE | Tree J |
| `enterprise`, `all`, `full`, `everything` | ENTERPRISE | Tree Z |

---

## Decision Tree A: FRONTEND
```
FRONTEND task
├── 1. Graphify (load component knowledge graph)
├── 2. Figma MCP (sync design tokens)
├── 3. Storybook MCP (check component catalog)
├── 4. ast-grep (structural search)
├── 5. TypeScript check (tsc --noEmit)
├── 6. ESLint (lint)
├── 7. Prettier (format)
├── 8. Playwright (E2E tests)
├── 9. Pa11y (accessibility)
├── 10. Lighthouse (performance)
├── 11. BundleWizard (bundle analysis)
├── 12. Report generation
└── CERTIFICATION
```

## Decision Tree B: BACKEND
```
BACKEND task
├── 1. Prisma validate (schema check)
├── 2. Prisma generate (client gen)
├── 3. ast-grep (structural search)
├── 4. Dependency Cruiser (module deps)
├── 5. Madge (circular check)
├── 6. Swagger/OpenAPI spec generation
├── 7. Spectral (API contract lint)
├── 8. TypeScript check (tsc --noEmit)
├── 9. ESLint (lint)
├── 10. Tests (Jest/Vitest)
├── 11. Security scan (semgrep + snyk)
├── 12. Coverage report
├── 13. Report generation
└── CERTIFICATION
```

## Decision Tree C: DATABASE
```
DATABASE task
├── 1. Prisma validate (schema)
├── 2. Prisma format (format schema)
├── 3. prisma-erd-generator (ERD)
├── 4. PostgreSQL MCP (query check)
├── 5. Migration validation
├── 6. SMCat (state machine for workflows)
├── 7. Report generation
└── CERTIFICATION
```

## Decision Tree D: ARCHITECTURE
```
ARCHITECTURE task
├── 1. Dependency Cruiser (full dep graph)
├── 2. Madge (circular dependencies)
├── 3. Knip + ts-prune (dead code)
├── 4. Graphviz (dependency visualization)
├── 5. PlantUML (architecture diagram)
├── 6. ADR creation/update
├── 7. Graphly (knowledge graph update)
├── 8. TypeDoc (architecture docs)
├── 9. Report generation
└── CERTIFICATION
```

## Decision Tree E: SECURITY
```
SECURITY task
├── 1. Semgrep (SAST - static analysis)
├── 2. Snyk (dependency vulns)
├── 3. Trivy (filesystem vulns)
├── 4. Checkov (IaC security)
├── 5. Gitleaks (git secrets)
├── 6. TruffleHog (secret detection)
├── 7. npm audit (dependency audit)
├── 8. Spectral (API security lint)
├── 9. Report generation
├── 10. Remediation ADR if needed
└── CERTIFICATION
```

## Decision Tree F: TESTING
```
TESTING task
├── 1. Playwright test (E2E)
├── 2. Artillery (load test)
├── 3. k6 (performance test)
├── 4. Coverage collection
├── 5. Pa11y (a11y test)
├── 6. Report generation
└── CERTIFICATION
```

## Decision Tree G: DOCUMENTATION
```
DOCUMENTATION task
├── 1. TypeDoc (API docs from source)
├── 2. ADR creation/update
├── 3. MkDocs build (project docs)
├── 4. MermaidCLI (diagrams)
├── 5. PlantUML (UML diagrams)
├── 6. Graphly (knowledge graph)
├── 7. Report generation
└── CERTIFICATION
```

## Decision Tree H: DESIGN
```
DESIGN task
├── 1. Figma MCP (sync from design)
├── 2. Storybook MCP (component catalog)
├── 3. StyleDictionary (build tokens)
├── 4. Pa11y (accessibility)
├── 5. Lighthouse (performance/a11y)
├── 6. Report generation
└── CERTIFICATION
```

## Decision Tree I: DEVOPS
```
DEVOPS task
├── 1. Docker compose validation
├── 2. CI/CD pipeline check
├── 3. GitHub Actions status
├── 4. Infrastructure audit
├── 5. Dependency updates
├── 6. Report generation
└── CERTIFICATION
```

## Decision Tree J: PERFORMANCE
```
PERFORMANCE task
├── 1. Lighthouse (browser perf)
├── 2. BundleWizard (bundle size)
├── 3. k6 (load test)
├── 4. Artillery (stress test)
├── 5. Report generation
└── CERTIFICATION
```

## Decision Tree Z: ENTERPRISE (FULL)
```
ENTERPRISE task (runs ALL trees)
├── FRONTEND tree (A)
├── BACKEND tree (B)
├── DATABASE tree (C)
├── ARCHITECTURE tree (D)
├── SECURITY tree (E)
├── TESTING tree (F)
├── DOCUMENTATION tree (G)
├── DESIGN tree (H)
├── DEVOPS tree (I)
├── PERFORMANCE tree (J)
├── Consolidated report
└── FULL CERTIFICATION
```

## Routing Rules
1. **Multi-classification**: If task matches multiple trees (e.g., "backend + security"), run all matched trees
2. **Fallback**: If a tool in the chain is missing, log warning and skip, do not block
3. **Gate failure**: If a validation gate fails, stop the chain and generate remediation report
4. **Certification**: Every chain ends with certification scoring
