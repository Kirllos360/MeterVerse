# Component Rules

## Enterprise Component Standards

### Button Variants (Consolidated to 6)
| Variant | Usage | Tailwind |
|:--------|:------|:---------|
| `default` | Primary actions | `bg-[--mv-primary]` |
| `secondary` | Secondary actions | `bg-secondary` |
| `outline` | Tertiary/border | `border border-input` |
| `ghost` | Minimal/toolbar | `hover:bg-accent` |
| `destructive` | Dangerous actions | `bg-destructive` |
| `link` | Navigation | `text-primary underline` |

### Card Standards
| Property | Token |
|:---------|:------|
| Background | `--mv-card` or `--mv-surface` |
| Border radius | `rounded-xl` (default) |
| Shadow | `shadow-sm` (default) |
| Padding | `p-6` (default) |
| Hover | `hover:shadow-md transition-shadow` |

### Table Standards
- Header: `bg-muted/50 text-sm font-medium`
- Row: `hover:bg-muted/30`
- Cell padding: `px-4 py-3`
- Sort indicator: inline chevron
- Empty state: "No records found" with icon

### Dialog/Modal Standards
- Overlay: `bg-black/50 backdrop-blur-sm`
- Content: `rounded-xl shadow-2xl`
- Animation: Framer Motion `scale: [0.95→1] + opacity: [0→1]`
- Width: `w-full max-w-lg` (configurable)
- Close: X button top-right + Escape key
