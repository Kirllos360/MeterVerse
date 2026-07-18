# Graphify Knowledge Graph Analysis

## Current Graph State
- **Source path**: `D:\meter\Meter\backend` (NestJS backend)
- **Manifest entries**: ~1,832 file hashes
- **Missing**: Frontend files are NOT in the graph

## What Graphify Tracks
| Metric | Current | Target |
|--------|---------|--------|
| Files indexed | ~1,832 backend files | Include all ~600+ frontend files |
| AST hashes | Backend only | Frontend + Admin |
| Communities | Backend modules only | Full platform |

## Frontend Files Missing From Graph
The entire `D:\meter\Frontend\src\` directory is not in the graphify manifest. To get accurate efficiency analysis, run:

```bash
graphify update D:\meter\Frontend\src
```

This would add ~600 frontend files and reveal:
- Duplicate component clusters (identified manually: 15 dead files, 4 duplicate pairs)
- Circular dependencies (suspected: some runtime→workspace→runtime paths)
- Import frequency (dead components would show zero imports)

## Efficiency Analysis (Manual)

| Pattern | Status | Efficiency |
|---------|--------|------------|
| Dead code | ❌ 15 files unreferenced | ~1,300 lines wasted |
| Duplicate shells | ❌ V2 + V3 coexist | Confusion, maintenance burden |
| Hardcoded colors | ❌ 50+ instances | Theme changes require 50+ edits |
| Inline styles | ❌ 64% of styles inline | No design token reuse |
| Shared components | ✅ shadcn/ui present | But workspace doesn't use them |
| Zustand stores | ✅ Single workspace store | Clean, no duplication |

**Recommendation**: Run `graphify update .` from `Frontend/` to get accurate metrics.
