# Frontend Change Policy

## Change Classification

| Class | Description | Approval | Timeline |
|:------|:------------|:---------|:---------|
| **PATCH** | Bug fix, typo, minor style | Self-approve | Immediate |
| **MINOR** | New component, feature page | Tech lead review | 1 day |
| **MAJOR** | Theme change, layout restructure | Architect approval | 1 week |
| **CRITICAL** | Auth, data flow, API change | Full governance | 2 weeks |

## Change Process
```
1. Classify change (PATCH/MINOR/MAJOR/CRITICAL)
2. Create branch from clean-main
3. Implement with tests
4. Run: tsc --noEmit + npm run lint + npm run build
5. Create PR with screenshots (before/after)
6. Get required approval
7. Merge to clean-main
8. Deploy after CI passes
```

## Prohibited Changes Without Governance Approval
- Replacing the admin SPA architecture
- Removing permission checks
- Changing authentication provider
- Modifying shadcn/ui base components
- Restructuring the page routing
- Removing existing API integrations
