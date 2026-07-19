# Graphiti Edges

Edges define relationships between nodes in the knowledge graph.

## Edge Types

| Type | Direction | Description |
|------|-----------|-------------|
| `depends_on` | A → B | Component A depends on component B |
| `implements` | A → B | Component A implements interface/spec B |
| `extends` | A → B | Component A extends component B |
| `contains` | A → B | Module A contains component B |
| `references` | A ↔ B | A and B reference each other |
| `documents` | A → B | Document A describes component B |
| `deployed_as` | A → B | Component A is deployed as B |
| `connects_to` | A → B | API A connects to database B |

## Edge Format

```json
{
  "source": "context-panel",
  "target": "use-workspace-store",
  "type": "depends_on",
  "metadata": {
    "strength": "strong",
    "description": "State management dependency"
  }
}
```
