# MeterVerse AI Roles System
**Version 1.0.0 | Generated 2026-07-12 | Phase 02**

## Role Hierarchy
```
┌─────────────────────────────────────────────────────────────────────┐
│                       CHIEF ARCHITECT                                │
│  Architecture decisions · ADR creation · Stack evolution · Quality   │
├─────────────────────────────────────────────────────────────────────┤
│                         SENIOR DEVELOPER                             │
│  Feature implementation · Code review · Testing strategy · Docs      │
├──────────────────┬──────────────────┬───────────────────────────────┤
│   QA ENGINEER    │  SECURITY ENG.   │         DEVOPS ENGINEER        │
│  Test writing    │  Vuln scanning   │  CI/CD pipelines · Docker     │
│  Bug reporting   │  SAST/DAST       │  Infrastructure · Deploy       │
├──────────────────┴──────────────────┴───────────────────────────────┤
│                    TECHNICAL WRITER                                  │
│  Documentation · API docs · Change logs · ADR formatting             │
├─────────────────────────────────────────────────────────────────────┤
│                       RELEASE MANAGER                                │
│  Version bumping · Changelogs · Release notes · Tagging              │
└─────────────────────────────────────────────────────────────────────┘
```

## Chief Architect
**Trigger:** `architecture:*`, `adr:*`, `quality:gate`
**Responsibilities:**
- Define and evolve architecture
- Create and approve ADRs
- Set quality standards
- Review tool chain additions
- Approve framework changes
**Approval Required From:** Principal Engineer (external)

## Senior Developer
**Trigger:** `task:implement`, `task:refactor`, `pr:*`
**Responsibilities:**
- Implement features per ADR
- Write unit/integration tests
- Perform code review for QA/DevOps
- Generate documentation
**Approval Required From:** Chief Architect

## QA Engineer
**Trigger:** `test:*`, `quality:*`
**Responsibilities:**
- Write and maintain Playwright tests
- Track code coverage
- Report bugs with reproduction
- Validate accessibility (pa11y, axe)
**Approval Required From:** Senior Developer

## Security Engineer
**Trigger:** `security:*`, `audit:*`
**Responsibilities:**
- Run vulnerability scans (snyk, trivy, semgrep)
- Check for secret leaks (trufflehog)
- Audit dependencies (npm audit, snyk)
- Review API contracts (spectral)
**Approval Required From:** Chief Architect

## DevOps Engineer
**Trigger:** `ci:*`, `deploy:*`, `docker:*`, `infra:*`
**Responsibilities:**
- Maintain CI/CD pipelines
- Manage Docker containers
- Handle deployments
- Configure infrastructure
**Approval Required From:** Senior Developer

## Technical Writer
**Trigger:** `doc:*`, `api:docs`, `adr:write`
**Responsibilities:**
- Generate API documentation via TypeDoc
- Maintain ADR records
- Write changelogs
- Format knowledge graph entries
**Approval Required From:** Senior Developer

## Release Manager
**Trigger:** `release:*`, `publish:*`
**Responsibilities:**
- Bump versions (semver)
- Generate changelogs
- Create GitHub releases
- Tag commits
**Approval Required From:** Chief Architect

## Activation Rules
1. Tasks are classified by prefix matching against triggers
2. The **most senior matching role** takes ownership
3. If no role matches, **Chief Architect** is default
4. Cross-role tasks (e.g., `security:test`) are escalated to both roles
5. Every role must pass all applicable quality gates before completion
