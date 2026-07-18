# MeterVerse AI Tool Router
**Version 1.0.0 | Generated 2026-07-12 | Phase 02**

## How It Works
Every incoming task is classified into a **Task Type**, which routes to the **Required Tools → Execution Order → Validation Gate**.

## Routing Table

| Task Type | Required Tools | Fallback | Mandatory | Validation |
|-----------|---------------|----------|-----------|------------|
| `architecture_review` | depcruise, madge, knip, ts-prune | ast-grep, code2flow | ✅ | Certification ≥ 80 |
| `security_audit` | snyk, trivy, checkov, semgrep, trufflehog | npm audit, grype | ✅ | Zero high/critical |
| `implementation` | ast-grep, jscodeshift, prettier, eslint | ripgrep | ❌ | tsc + eslint pass |
| `testing` | playwright, artillery, bruno | k6 | ✅ | 100% critical paths |
| `api_lint` | spectral, redocly, swagger-cli | — | ✅ | Zero errors |
| `dependency_audit` | snyk, npm audit, madge | trivy | ✅ | No circular deps |
| `bundle_analysis` | bundle-wizard, lighthouse | — | ❌ | Bundle < threshold |
| `accessibility` | pa11y, lighthouse, axe | — | ✅ | Score ≥ 90 |
| `design_sync` | @figma-export/cli, style-dictionary | — | ❌ | Tokens match |
| `documentation` | typedoc, log4brains, adr | mermaid-cli, plantuml | ❌ | No broken links |

## Routing Rules
1. **Multiple task types**: Execute in dependency order (architecture → implementation → testing)
2. **Missing tools**: Use fallback, log warning, file enhancement request
3. **Validation failure**: Stop pipeline, generate report, do not proceed
4. **Certification**: Every task produces a certification score update

## Quick Reference (for AI Prompts)
```
[task_type] → [tools comma-separated] → [validation gate]
```
Example:
```
architecture_review → depcruise,madge,knip,ts-prune → certification ≥ 80
```

## Invocation Examples
```bash
# Architecture review
depcruise src --output-type err && madge --circular src/index.ts && knip && ts-prune

# Security audit
snyk test && trivy fs --severity CRITICAL,HIGH . && checkov -d . && semgrep --config=auto . && trufflehog filesystem . --only-verified

# Implementation
ast-grep search && jscodeshift transform && prettier --write && eslint --fix
```
