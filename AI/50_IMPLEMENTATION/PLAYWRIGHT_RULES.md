# MeterVerse Playwright Testing Rules

**Defines all Playwright testing requirements for MeterVerse frontend.**

---

## 1. Test Requirements Per Page

Every production page must have Playwright tests covering:

| Test Category | Tests Required |
|---------------|---------------|
| Rendering | Page renders without errors, all expected elements visible |
| Content | Headings, labels, data values correct |
| Navigation | Page navigation works, breadcrumbs correct |
| Interactions | Click, type, select operations work |
| Responsive | Desktop (1440px), Laptop (1280px), Tablet (768px), Mobile (375px) |
| Accessibility | Semantic structure, lang attribute, landmarks, labels |
| Performance | Page loads within <5s |
| Console | No console errors during navigation |

## 2. Viewport Coverage

| Viewport | Width × Height | Device |
|----------|---------------|--------|
| Desktop | 1440 × 900 | Standard desktop |
| Laptop | 1280 × 800 | Common laptop |
| Tablet | 768 × 1024 | iPad portrait |
| Mobile | 375 × 812 | iPhone X portrait |

## 3. Test File Structure

```
e2e/
├── foundation.spec.ts     # Landing page tests
├── [domain].spec.ts       # Per-domain page tests
├── reports.spec.ts        # Report capture tests
└── reports/               # Generated test reports
    ├── playwright-validation-report.md
    ├── console-report.json
    ├── network-report.json
    ├── accessibility-report.json
    └── performance-report.json
```

## 4. Report Capture Tests

For each phase, the `reports.spec.ts` must capture:

| Report | Content | Format |
|--------|---------|--------|
| Console report | All console entries, errors, warnings | JSON + Markdown |
| Network report | All requests, status codes, types | JSON |
| Accessibility report | Semantic checks, heading structure, alt text | JSON + Markdown |
| Performance report | Navigation timing, paint timing, resource sizes | JSON + Markdown |
| Playwright validation | Full test results summary | Markdown |

## 5. Test Assertion Standards

| Assertion | Standard |
|-----------|----------|
| Element visibility | `toBeVisible()` |
| Text content | `toContainText()` |
| Element count | `toHaveCount()` |
| Page URL | `toHaveURL()` |
| Attribute value | `toHaveAttribute()` / `toHaveClass()` / `toHaveCSS()` |
| Console errors | `toEqual([])` — zero errors expected |
| Network failures | All requests must return status 200 |

## 6. Continuous Integration

- Playwright runs on every PR/merge
- Tests run against production build (`npx next build && npx next start`)
- Chromium project only (add Firefox/WebKit when full coverage needed)
- Failed tests produce HTML report with screenshots
- Visual regression comparison against baseline screenshots
