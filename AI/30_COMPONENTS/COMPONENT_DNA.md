# MeterVerse Component DNA

**Governs how all UI components behave, their states, accessibility requirements, and composition rules.**

---

## 1. Component Philosophy

- Every component is a visual primitive that inherits from Design DNA tokens
- Components are stateless where possible (state managed by hooks/stores)
- Components accept semantic props, not style props
- Every component has defined states: default, hover, focus, active, disabled, loading, error
- Components are accessible by default (ARIA attributes built in)

## 2. Component States

Every interactive component must implement these states:

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Normal appearance | Ready for interaction |
| Hover | Slight background/border change | Mouse hover |
| Focus | 2px brand-500 ring | Keyboard or click focus |
| Active | Pressed state | MouseDown/touch |
| Disabled | 50% opacity, no pointer events | Not interactive |
| Loading | Skeleton or spinner | Content being fetched |
| Error | Red border + error message | Validation failure |
| Read Only | Muted appearance, no interaction | Display only |

## 3. Component Categories

| Category | Examples |
|----------|----------|
| Primitives | Button, Input, Select, Checkbox, Radio, Switch, Textarea |
| Surface | Card, Dialog, Drawer, Sheet, Popover, Tooltip |
| Navigation | Tabs, Breadcrumb, Pagination, Menu, Sidebar |
| Data | Table, Badge, Avatar, Progress, Skeleton |
| Feedback | Toast, Alert, ProgressBar |
| Form | FormField, FormLabel, FormMessage, FormControl |

## 4. Component Composition Rules

| Rule | Description |
|------|-------------|
| Single responsibility | One component, one job |
| Composition over props | Use children slots, not configuration props |
| Semantic HTML | Use correct HTML elements (button, nav, table) |
| No style props | Components don't accept color/size/spacing props directly |
| Controlled by default | Components accept value + onChange |
| Ref forwarding | All interactive components forward refs |
| Display name | Set displayName for debugging |

## 5. Component Naming

| Pattern | Example | Usage |
|---------|---------|-------|
| [Component] | Button, Card, Table | Primitives |
| [Component][Variant] | ButtonPrimary, DialogConfirm | Style variants |
| [Domain][Component] | CustomerTable, MeterAssignForm | Business components |
| use[Feature] | useCustomerList, useAuth | Hooks |
| [Component]Provider | ThemeProvider, QueryProvider | Context providers |

## 6. Animation and Motion

- All interactive transitions use --motion-duration-fast (150ms)
- Surface transitions (dialogs, drawers) use --motion-duration-normal (200ms)
- Respects prefers-reduced-motion: all animations become instant
- No parallax, no auto-play, no infinite animations
