# MeterVerse Changelog

## v8.0.0 — Enterprise Release Candidate (2026-07-19)

### Phase 33-36: Final Enterprise Polish
- Screenshot automation: 95 screenshots across 19 routes × 5 viewports
- Visual regression testing: 57 comparison points, pixelmatch-based
- Visual regression CI workflow (fails on >1% diff)
- Enterprise UX Certification: 72/100 across 8 categories
- Full documentation suite: UI architecture, design system, colors, typography, spacing, elevation, motion
- Theme documentation: 10 themes, dark mode, RTL
- Updated CHANGELOG, ROADMAP, PRD, ADRs

### Phase 27-32: Visual Consistency
- Brand restoration: all colors derive from single `--brand` token
- Sidebar rebuild: 72/260px, 3px indicator, no pills, no borders
- Inspector redesign: 320px, 4 sections, surface tokens
- Border audit: 80% of decorative borders removed
- Login redesign: 45/55 split, live preview, responsive
- Component consistency: radius, height, focus aligned

### Phase 22-26: Enterprise Hardening
- System hardening: 15+ files fixed, ~45 color replacements
- Visual audit: 52 issues catalogued (7C/18H/14M/10L)
- Component audit: 166 components inventoried across 12 categories
- Enterprise final review: 30 issues documented

### Phase 18-21: Enterprise Foundation

### Added
- Enterprise runtime kernel with lifecycle management
- 11 registries for metadata-driven architecture
- Event Bus with replay, versioning, debugging
- Data Engine with cache, offline, optimistic updates
- Workflow Engine with approval and scheduling
- Design token system with 38+ CSS variables
- 10 themes with light/dark mode (Vercel, Claude, WhatsApp, etc.)
- RTL support infrastructure (dynamic dir, Arabic fonts)
- JWT authentication with BFF API routes
- BFF backend pattern with mock/proxy switching
- FileUpload, ContextMenu, ErrorBoundary components
- GlobalSearch, SmartSearch, CommandPalette
- 7 GitHub Actions workflows (build, tests, codeql, release, etc.)
- Graphiti knowledge graph with 3 ADRs
- SpecKit validation suite (22 checks, 100% passing)
- Sidebar (3 modes, 11 design tokens)
- Inspector (12 design tokens, never inherits workspace)

### Changed
- All hardcoded `#00BFA5` → `var(--brand-primary)` across 50+ files
- All hardcoded rgba() → CSS variable references across 31 files
- AuthRuntime rewritten for real HTTP API calls
- Login page redesigned: 45/55 split, 480px form, live dashboard preview
- Login page fixed: password input uses e.target.value (was broken)
- Dark-mode.css: removed 60+ lines of !important CSS hacks
- CI/CD: fixed YAML structure, removed dead backend job
- Sidebar uses own tokens (never inherits body)
- Inspector uses own tokens (never inherits workspace)
- Admin pages use new --admin-* tokens

### Removed
- 28 dead V2 files (shell components, enterprise runtimes)
- Duplicate Toast.tsx (migrated to sonner)
- Duplicate SearchInput.tsx (migrated to GlobalSearch)
- CSS hacks for hardcoded colors (no longer needed)

### Fixed
- Password input onChange uses e.target.value (was e.target.password)
- ContextPanel hardcoded rgba → inspector tokens
- 45+ hardcoded colors across 16 files → CSS variable references
- Enterprise-apps hardcoded status colors
- Admin pages hardcoded colors

### Security
- JWT authentication with httpOnly cookies
- BFF pattern prevents direct backend exposure
- 4 security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection)
- Auth bypass protection on all routes
- CodeQL + Semgrep + TruffleHog in CI
- DeepSeek AI code review on every PR

### Performance
- Next.js 16 with Turbopack
- Framer Motion animations
- VirtualScroller with overscan
- Lazy loading with IntersectionObserver
- Bundle optimization for framer-motion, recharts, tabler-icons

### Accessibility
- 0 a11y violations on all 25 routes
- Keyboard navigation (Escape, Arrows, Enter)
- Focus rings with :focus-visible
- Semantic roles on dialogs, trees, tables
- aria-labels on all interactive elements
