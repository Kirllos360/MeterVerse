# Enterprise Administration Platform — Planning

## Current State
- 56 GenericAdminPage-based admin pages
- CRUD operations via page-configs.ts
- No spreadsheet-style editing, no drag-and-drop

## Target State (BaseRow-style)

### Spreadsheet Database
| Feature | Description | Effort |
|---------|-------------|:------:|
| Data Grid | Excel-like editable table with cell selection | 3 sessions |
| Bulk Editing | Multi-row edit with change preview | 2 sessions |
| Filters | Column-based filtering with saved views | 2 sessions |
| Sorting | Multi-column sort, persistent per user | 1 session |
| Column Visibility | Show/hide/reorder columns | 1 session |
| Row Grouping | Group by column value with aggregates | 2 sessions |

### Data Management
| Feature | Description | Effort |
|---------|-------------|:------:|
| Import Wizard | CSV/Excel import with mapping UI | 3 sessions |
| Export Wizard | Data export with column selection | 2 sessions |
| Data Validation | Row-level validation rules | 2 sessions |
| Audit History | Cell-level change tracking | 2 sessions |
| Rollback | Undo last change | 1 session |
| Version History | Row versioning with diffs | 2 sessions |

### Schema Management
| Feature | Description | Effort |
|---------|-------------|:------:|
| Custom Fields | Add fields to existing tables via UI | 3 sessions |
| Lookup Tables | Create reference tables | 2 sessions |
| Formula Builder | Calculated fields expression editor | 3 sessions |
| Relationship Builder | Link tables via UI | 2 sessions |
| Dynamic Forms | Auto-generated CRUD forms | 2 sessions |

**Total estimated effort: 28 sessions** (Wave 07 candidate)
