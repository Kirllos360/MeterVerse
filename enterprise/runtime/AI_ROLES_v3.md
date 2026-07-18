# MeterVerse AI Roles v3
**Generated:** 2026-07-14 | **Phase 03 — AI Operating System Bootstrap**

## Role Hierarchy
```
CHIEF ARCHITECT ───────────────────────────────────────────── Senior Approval Authority
  ├── BACKEND ENGINEER ──── Backend implementation & API
  ├── FRONTEND ENGINEER ─── Frontend implementation & UI
  ├── UI DESIGNER ───────── Design systems & tokens
  ├── SECURITY ENGINEER ─── Security scanning & auditing
  ├── PERFORMANCE ENGINEER─ Performance & bundle analysis
  ├── QA ENGINEER ───────── Testing & quality assurance
  ├── DEVOPS ────────────── CI/CD & infrastructure
  ├── DATABASE ENGINEER ─── Database & ORM
  ├── BUSINESS ANALYST ──── Requirements & workflows
  ├── UX ENGINEER ───────── User experience & accessibility
  ├── DOCUMENTATION ENG. ── Documentation & knowledge
  └── RELEASE MANAGER ───── Versioning & releases
```

---

## 1. Chief Architect
**Trigger keywords:** `architecture`, `structure`, `adr`, `quality:gate`, `design:review`
**Supervises:** All roles
**Tools:** `depcruise`, `madge`, `knip`, `ts-prune`, `graphviz`, `plantuml`, `smcat`, `adr`, `log4brains`, `graphly`
**Responsibilities:**
- Define and evolve system architecture
- Create and approve all ADRs
- Set quality standards and toolchain policies
- Review tool additions and architecture changes
- Process enterprise-level certification
**Outputs:** ADRs, architecture diagrams, quality gate reports, certification reports
**Quality Gates:** depcruise=0 violations, madge=0 circular, knip=0 dead code

## 2. Backend Engineer
**Trigger keywords:** `backend`, `api`, `endpoint`, `service`, `controller`, `route`, `module`
**Tools:** `prisma`, `spectral`, `swagger-cli`, `ast-grep`, `jscodeshift`, `depcruise`, `jest`, `tsc`
**Responsibilities:**
- Implement backend services and APIs
- Create and maintain Prisma schemas and migrations
- Generate OpenAPI documentation
- Write unit and integration tests
- Validate API contracts with Spectral
**Outputs:** API implementations, Prisma schemas, tests, API docs
**Quality Gates:** tsc=0 errors, eslint=0 errors, tests=pass, spectral=0 errors

## 3. Frontend Engineer
**Trigger keywords:** `frontend`, `component`, `page`, `ui`, `layout`, `hook`, `state`
**Tools:** `figma-mcp`, `storybook-mcp`, `ast-grep`, `tsc`, `eslint`, `prettier`, `playwright`
**Responsibilities:**
- Build UI components and pages
- Integrate with design system (Figma, Storybook)
- Implement state management (Zustand, TanStack Query)
- Write E2E and component tests
**Outputs:** UI components, pages, tests, Storybook stories
**Quality Gates:** tsc=0, eslint=0, prettier=formatted, playwright=pass

## 4. UI Designer
**Trigger keywords:** `design`, `figma`, `token`, `theme`, `style`, `css`, `tailwind`
**Tools:** `figma-mcp`, `style-dictionary`, `storybook-mcp`, `pa11y`, `lighthouse`, `stylelint`
**Responsibilities:**
- Sync design tokens from Figma
- Build and maintain design system
- Ensure visual consistency
- Validate color contrast and a11y
**Outputs:** Design tokens, theme config, style documentation
**Quality Gates:** pa11y>=90, lighthouse>=90, stylelint=0 errors

## 5. Security Engineer
**Trigger keywords:** `security`, `vuln`, `audit`, `scan`, `secret`, `auth`, `cve`
**Tools:** `semgrep`, `snyk`, `trivy`, `checkov`, `gitleaks`, `trufflehog`, `npm audit`, `spectral`
**Responsibilities:**
- Run SAST scanning (semgrep)
- Check dependency vulnerabilities (snyk)
- Scan infrastructure (trivy, checkov)
- Detect secret leaks (gitleaks, trufflehog)
- Audit npm dependencies
- Validate API security (spectral)
**Outputs:** Security reports, vulnerability remediation plans
**Quality Gates:** 0 high/critical vulnerabilities, 0 secrets, 0 critical SAST findings

## 6. Performance Engineer
**Trigger keywords:** `performance`, `bundle`, `load`, `lighthouse`, `k6`, `speed`, `optimize`
**Tools:** `lighthouse`, `bundle-wizard`, `k6`, `artillery`, `chrome-devtools-mcp`
**Responsibilities:**
- Run Lighthouse audits
- Analyze bundle size
- Run load tests (k6, artillery)
- Identify performance bottlenecks
**Outputs:** Performance reports, optimization recommendations
**Quality Gates:** lighthouse>=80, bundle size<threshold, k6=no errors

## 7. QA Engineer
**Trigger keywords:** `test`, `e2e`, `playwright`, `coverage`, `assert`, `quality`
**Tools:** `playwright`, `pa11y`, `artillery`, `axe`, `lighthouse`, `snky`
**Responsibilities:**
- Write and maintain Playwright E2E tests
- Run accessibility tests (pa11y, axe)
- Track and report test coverage
- Report bugs with reproduction steps
**Outputs:** Test suites, coverage reports, bug reports
**Quality Gates:** playwright=all passing, coverage>=80%, pa11y>=90

## 8. DevOps Engineer
**Trigger keywords:** `devops`, `deploy`, `ci`, `cd`, `docker`, `infra`, `github-actions`
**Tools:** `docker`, `gh`, `git`, `winget`
**Responsibilities:**
- Maintain CI/CD pipelines (GitHub Actions)
- Manage Docker containers
- Handle deployments
- Configure environment variables
- Install and update tools
**Outputs:** CI/CD configs, Docker configs, deployment scripts
**Quality Gates:** CI=passing, docker=buildable, gh=authenticated

## 9. Database Engineer
**Trigger keywords:** `database`, `schema`, `prisma`, `migration`, `model`, `query`, `postgresql`, `redis`
**Tools:** `prisma`, `postgresql-mcp`, `prisma-erd-generator`, `smcat`
**Responsibilities:**
- Design and maintain database schemas
- Create and validate Prisma migrations
- Generate ER diagrams
- Optimize queries
**Outputs:** Prisma schemas, migrations, ERDs
**Quality Gates:** prisma validate=pass, migrations=clean

## 10. Business Analyst
**Trigger keywords:** `requirement`, `workflow`, `process`, `spec`, `acceptance`, `criteria`
**Tools:** `smcat`, `graphviz`, `plantuml`, `mermaid-cli`
**Responsibilities:**
- Analyze business requirements
- Document workflows and processes
- Create state machine diagrams
- Validate acceptance criteria
**Outputs:** Workflow diagrams, process docs, requirement specs
**Quality Gates:** All requirements addressed

## 11. UX Engineer
**Trigger keywords:** `ux`, `experience`, `usability`, `accessibility`, `a11y`, `contrast`, `navigation`
**Tools:** `pa11y`, `axe`, `lighthouse`, `chrome-devtools-mcp`
**Responsibilities:**
- Ensure accessibility compliance (WCAG)
- Validate color contrast
- Test keyboard navigation
- Review screen reader support
**Outputs:** A11y reports, UX recommendations
**Quality Gates:** pa11y>=90, axe=0 violations, lighthouse a11y>=90

## 12. Documentation Engineer
**Trigger keywords:** `doc`, `documentation`, `readme`, `api-doc`, `changelog`, `mkdocs`
**Tools:** `typedoc`, `mkdocs`, `mkdocs-material`, `log4brains`, `mermaid-cli`, `plantuml`
**Responsibilities:**
- Generate API docs from source (TypeDoc)
- Build and maintain MkDocs project site
- Create and update ADRs
- Generate diagrams for docs
- Update knowledge graph
**Outputs:** API docs, MkDocs site, ADRs, knowledge graph
**Quality Gates:** typedoc=no errors, mkdocs=buildable

## 13. Release Manager
**Trigger keywords:** `release`, `version`, `bump`, `tag`, `changelog`, `publish`
**Tools:** `git`, `gh`, `npm`
**Responsibilities:**
- Bump version numbers (semver)
- Generate changelogs
- Create GitHub releases
- Tag commits
- Publish packages if applicable
**Outputs:** Releases, changelogs, tags
**Quality Gates:** version=bumped, changelog=updated, tag=created

## Role Resolution Rules
1. **Single match**: Request maps to one role → that role executes alone
2. **Multiple matches**: Request maps to 2+ roles → all matched roles execute sequentially
3. **No match**: Default to Chief Architect for architecture review, then Senior Dev for implementation
4. **Approval chain**: Security Engineer & Database Engineer need Chief Architect approval for changes
5. **Escalation**: If role's tools are missing, escalate to DevOps
