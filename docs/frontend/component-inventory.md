# Component Inventory

## Summary
- **Total Components**: 125
- **shadcn/ui Primitives**: 40+ (Button, Card, Table, Dialog, Input, Select, Badge, etc.)
- **Layout Components**: Sidebar, Header, AdminLayout, WorkspaceLayout
- **Feature Components**: Per feature module

## UI Primitive Coverage
| Component | Status | Notes |
|:----------|:-------|:------|
| Button | ✅ | 6 variants via class-variance-authority |
| Card | ✅ | Header, Content, Title, Footer |
| Table | ✅ | TanStack React Table wrapper |
| Dialog | ✅ | AlertDialog + Sheet |
| Input | ✅ | With label, error state |
| Select | ✅ | Native + custom |
| Badge | ✅ | 4 variants |
| Skeleton | ✅ | Loading states |
| Toast | ✅ | sonner |
| Tabs | ✅ | Custom tab implementation |
| Dropdown | ✅ | cmdk/kbar |

## Missing Components
| Component | Priority | Reason |
|:----------|:--------:|:-------|
| ThemeSwitcher | HIGH | No theme toggle UI |
| CommandPalette | MEDIUM | kbar installed, not wired |
| EmptyState | MEDIUM | Used inline, no component |
| ErrorBoundary | LOW | Exists in effects/ |
