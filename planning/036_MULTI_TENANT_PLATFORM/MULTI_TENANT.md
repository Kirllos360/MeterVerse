# Multi-Tenant Enterprise Platform — Planning

## Tenant Hierarchy
```
Organization
    │
    ├── Projects
    │     ├── Areas
    │     │     ├── Sites
    │     │     │     └── Meters
    │     │     └── Customers
    │     └── Tariffs
    │
    └── Users
          ├── Admins
          ├── Operators
          └── Viewers
```

## Tenant Isolation
| Strategy | Description | When |
|:---------|:------------|:----:|
| Schema per tenant | Each organization gets own DB schema | Large tenants (>100K records) |
| Row-level isolation | Organizations filtered by org_id column | Small-medium tenants |
| Hybrid | Large tenants get schemas, small share a schema | Enterprise |

## Tenant Features
| Feature | Description | Priority |
|:--------|:------------|:--------:|
| White-label branding | Custom logo, colors, domain | P1 |
| License management | Meter count, user count, feature tiers | P1 |
| Feature flags per tenant | Enable/disable features per org | P1 |
| Resource quotas | API calls, storage, users | P2 |
| Tenant analytics | Per-organization KPIs | P2 |
| Cross-tenant admin | Super admin view across all tenants | P1 |
