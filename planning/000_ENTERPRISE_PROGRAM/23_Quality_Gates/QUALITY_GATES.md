# Quality Gates

**Purpose:** Every phase must pass all 10 gates before marking complete.

## Gate Definitions

| Gate | Check | Verifier | Blocks If |
|------|-------|----------|-----------|
| G01 Architecture | Architecture approved by Chief Architect | Graphiti compare | Missing nodes or edges |
| G02 Database | Schema changes validated | Prisma validate + migration test | Migration fails or missing rollback |
| G03 Backend | All endpoints working | Integration tests pass | Any endpoint returns 500 |
| G04 Frontend | All pages render | Playwright smoke tests | Any page errors |
| G05 Runtime | Services operational | Health check endpoint | Service fails |
| G06 Security | No vulnerabilities | npm audit + CodeQL | Critical vulnerability |
| G07 Performance | Response time within SLA | k6 load test | P99 > 500ms |
| G08 Business | Business rules verified | Rule test suite | Business rule fails |
| G09 Evidence | Evidence committed | GATE_CHECK script | Missing evidence |
| G10 Release | Release ready | Governance board | Missing sign-off |

## Gate Process
```
Each task → passes task gates → marks COMPLETE
Each phase → runs T99 audit → passes all 10 gates → marks COMPLETE
Wave → all phases complete → final review → marks COMPLETE
```
