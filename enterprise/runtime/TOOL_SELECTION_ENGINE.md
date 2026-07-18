# MeterVerse Intelligent Tool Selection Engine v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration**

## Engine Overview
The AI automatically selects the optimal tool chain for any task using classification, intelligence scores, and dependency graph traversal.

```
Task Description
  │
  ▼
┌─────────────────────────────────────┐
│ CLASSIFIER                          │
│ keyword → task type → chain ID      │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ TOOL SELECTOR                       │
│ chain ID → tools from intelligence  │
│ layer → filter by availability      │
│ → order by priority + dependency    │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ EXECUTION ORDERER                   │
│ topological sort from dependency    │
│ graph → parallel vs serial split    │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ TOOL CHAIN (auto-executed)          │
└─────────────────────────────────────┘
```

## Auto-Selection Rules

### Rule 1: Task Classification
| Keywords | Task Type | Chain ID |
|----------|-----------|----------|
| `generate api`, `create endpoint`, `openapi` | API Generation | CHAIN-API-GEN |
| `create page`, `react component`, `ui element` | Frontend | CHAIN-FE |
| `security`, `vuln`, `audit`, `cve` | Security | CHAIN-SEC |
| `test`, `e2e`, `playwright`, `coverage` | Testing | CHAIN-TEST |
| `schema`, `migration`, `prisma`, `model` | Database | CHAIN-DB |
| `architecture`, `refactor`, `restructure` | Architecture | CHAIN-ARCH |
| `bundle`, `performance`, `load` | Performance | CHAIN-PERF |
| `doc`, `documentation`, `readme`, `changelog` | Documentation | CHAIN-DOC |
| `full`, `certify`, `enterprise`, `all` | Full Certification | CHAIN-FULL |
| *default* | Code Change | CHAIN-CODE |

### Rule 2: Tool Selection Algorithm
```
For each task type:
  1. Load chain template from executionGraph
  2. For each slot in chain:
     a. Check primary tool availability (master-registry.json)
     b. If available: use primary
     c. If not: use fallback from intelligence layer
     d. If no fallback: skip with warning
  3. Validate chain completeness
  4. Return ordered tool list
```

### Rule 3: Execution Ordering
```
1. Build dependency graph subset from TOOL_DEPENDENCY_GRAPH.json
2. Topological sort: tools with no deps first
3. Parallel execution: tools that don't depend on each other
4. Serial execution: tools that consume each other's outputs
5. Validation gates run after their respective tool groups
```

## Chains

### CHAIN-API-GEN: Generate API
```
1. OpenAPIGenerator (generate from spec)
2. Spectral (validate contract)
3. SwaggerCLI (bundle spec)
4. TypeDoc (generate API docs)
5. Contract Validator (verify endpoints)
6. Documentation Generator (mkdocs update)
7. Validation (spectral 0 errors)
8. Certification
```

### CHAIN-FE: Create Frontend Component
```
1. Graphify (component knowledge graph)
2. DependencyCruiser (module check)
3. ast-grep (structural search)
4. KnowledgeGraph (project context)
5. StyleDictionary (design tokens)
6. Storybook (component catalog)
7. Pa11y (accessibility)
8. Playwright (E2E tests)
9. Lighthouse (performance)
10. BundleWizard (bundle size)
11. Knip (dead code)
12. Certification
```

### CHAIN-SEC: Security Audit
```
1. Semgrep (SAST)
2. Snyk (dependency vulns)
3. Checkov (IaC security)
4. TruffleHog (secret detection)
5. Gitleaks (git secrets)
6. OWASP DC (dependency check)
7. npm audit
8. Validation (0 critical/high)
9. Certification
```

### CHAIN-TEST: Testing
```
1. Playwright (E2E)
2. k6 (load test)
3. Artillery (stress test)
4. Pa11y (a11y test)
5. Coverage collection
6. Validation (all pass)
7. Certification
```

### CHAIN-DB: Database Change
```
1. Prisma validate (schema)
2. Prisma format
3. prisma-erd-generator (ERD)
4. PostgreSQL MCP (query validate)
5. Migration validation
6. Certification
```

### CHAIN-ARCH: Architecture Review
```
1. DependencyCruiser (full dep graph)
2. Madge (circular deps)
3. Knip + ts-prune (dead code)
4. Graphviz (visualize)
5. PlantUML (architecture diagram)
6. ADR creation/update
7. Graphly (knowledge graph)
8. TypeDoc (docs)
9. Certification
```

### CHAIN-PERF: Performance
```
1. Lighthouse (browser perf)
2. BundleWizard (bundle size)
3. k6 (load test)
4. Artillery (stress test)
5. ChromeDevTools MCP (profile)
6. Certification
```

### CHAIN-DOC: Documentation
```
1. TypeDoc (API docs)
2. ADR (decisions)
3. MkDocs (project docs)
4. MermaidCLI (diagrams)
5. PlantUML (UML)
6. Graphly (knowledge graph)
7. Certification
```

### CHAIN-FULL: Full Certification
```
Run ALL chains above in dependency order:
1. CHAIN-ARCH (architecture baseline)
2. CHAIN-SEC (security baseline)
3. CHAIN-PERF (performance baseline)
4. CHAIN-DB (database baseline)
5. CHAIN-API-GEN (API baseline)
6. CHAIN-TEST (testing)
7. CHAIN-FE (frontend)
8. CHAIN-DOC (documentation)
9. Consolidated report
10. Full certification
```

### CHAIN-CODE: General Code Change (default)
```
1. TypeScript (tsc --noEmit)
2. ESLint
3. Prettier
4. DependencyCruiser
5. Madge
6. Tests (playwright/jest)
7. Snyk (if dependency changed)
8. Certification
```
