# Component Upgrade Plan

## Audit Summary
| Component | Current State | Issues | Upgrade Priority |
|:----------|:-------------|:-------|:----------------|
| Button | 6 variants via cva | No loading state | 🔴 HIGH |
| Card | 3 shadow levels | Inconsistent padding | 🟡 MEDIUM |
| Table | TanStack wrapper | Missing sticky header | 🟡 MEDIUM |
| Dialog | AlertDialog + Sheet | No motion | 🟡 MEDIUM |
| Badge | 4 variants | No dot variant | 🟢 LOW |
| Toast | sonner | Position fixed | 🟢 LOW |

## Upgrade Plan
1. Add loading state to Button component
2. Standardize Card padding to p-6
3. Add sticky header to Table
4. Add Framer Motion to Dialog open/close
5. Add dot variant to Badge
