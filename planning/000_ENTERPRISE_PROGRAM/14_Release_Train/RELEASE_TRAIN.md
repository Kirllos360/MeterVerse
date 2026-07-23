# Release Train

**Purpose:** Standardized release process for every wave.

```
Development → QA → UAT → Pilot → Production → Hotfix
```

| Stage | Activities | Gates |
|-------|-----------|-------|
| Development | Feature implementation, unit tests, component tests | All tests pass, GATE_CHECK passes |
| QA | Integration tests, regression tests, security scan | Zero P1/P2 issues |
| UAT | User acceptance testing, stakeholder demo | Sign-off from product owner |
| Pilot | Limited production rollout (1 org/area) | Pilot success criteria met |
| Production | Full rollout | All waves complete, enterprise release criteria met |
| Hotfix | Emergency fixes bypassing normal pipeline | Security/compliance exemption |

### Release Cadence
- Wave: Every 6-12 weeks
- Hotfix: Within 24 hours for P1 issues
- Patch: Within 1 week for P2 issues
