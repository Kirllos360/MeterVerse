# Enterprise Testing Pyramid

**Purpose:** Every feature maps to required test types.

```
            ⬆ Chaos
          ⬆ Load/Stress
        ⬆ Security
      ⬆ E2E (Playwright)
    ⬆ API/Integration
  ⬆ Component (Storybook)
⬆ Unit (Vitest)
```

| Test Type | Tool | Coverage Target | Wave |
|-----------|------|----------------|------|
| Unit | Vitest | 70%+ | Wave 02 |
| Component | Vitest + Testing Library | 50%+ | Wave 02 |
| API/Integration | Vitest + supertest | 90%+ endpoints | Wave 02 |
| E2E | Playwright | All critical paths | Wave 02 |
| Security | CodeQL + npm audit | Zero critical | Wave 04 |
| Performance | k6 | P99 < 500ms | Wave 04 |
| Load | k6 | 10K concurrent | Wave 06 |
| Accessibility | axe-core | WCAG 2.1 AA | Wave 02 |
| Chaos | chaos-engineering | Recovery within RTO | Wave 06 |
| Regression | Full suite | 100% pass | Every PR |
