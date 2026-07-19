# Graphiti Nodes

Each node represents a discrete component of the MeterVerse system.

## Node Types

| Type | Description | Examples |
|------|-------------|----------|
| `component` | UI component | ContextPanel, FileUpload, ErrorBoundary |
| `module` | Feature module | auth, registry, event-bus, data-engine |
| `api` | API endpoint or service | auth-login, product-service, BFF-route |
| `database` | Data store or schema | PostgreSQL, Prisma schema, cache |
| `decision` | Architecture Decision Record | ADR-001, ADR-002 |
| `spec` | Specification document | PRD, ROADMAP, CHANGELOG |
| `runtime` | Runtime knowledge | kernel, workflow, event-bus |

## Node Format

```json
{
  "id": "context-panel",
  "type": "component",
  "name": "ContextPanel",
  "path": "Frontend/src/workspace/components/ContextPanel.tsx",
  "dependencies": ["use-workspace-store", "use-translation", "framer-motion"],
  "interfaces": ["InspectorPanel"],
  "description": "Inspector panel showing entity properties and metadata"
}
```
