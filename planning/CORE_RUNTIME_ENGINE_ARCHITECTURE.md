# Enterprise Core Runtime Engine Architecture

**Purpose:** Define MeterVerse's runtime foundation — how modules load, plugins work, features register, services communicate, and configuration controls behavior without rewriting code.

**Design Principle:** Everything is metadata. Screens, forms, fields, tables, workflows, reports, dashboards, permissions, validation rules, integrations — all driven by metadata at runtime.

---

## 1. Runtime Kernel

### 1.1 Runtime Bootstrap Sequence
```
1. Environment Validation → Check JWT_SECRET, DATABASE_URL, CORS_ORIGIN
2. Database Connection → Prisma connect + health check
3. Service Registry → Load all registered services
4. Module Loader → Discover and load installed modules
5. Plugin Engine → Initialize active plugins
6. Capability Registry → Register all capabilities
7. Configuration Loader → Load runtime configuration from DB
8. Event Bus → Start event system
9. HTTP Server → Start Express on configured port
10. Health Check → Verify all services operational
```

### 1.2 Service Lifecycle
| State | Description | Transition |
|:------|:------------|:-----------|
| `REGISTERED` | Service known to registry | After module discovery |
| `INITIALIZING` | Service starting up | After config loaded |
| `ACTIVE` | Service operational | After health check passes |
| `DEGRADED` | Service partially available | After soft failure |
| `STOPPED` | Service shut down | After graceful stop |
| `FAILED` | Service crashed | After unrecoverable error |

### 1.3 Module Lifecycle
```
DISCOVERED → VALIDATED → INSTALLED → ACTIVATED → RUNNING → STOPPED → UNINSTALLED
```

### 1.4 Core Interfaces
```typescript
interface Service {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  initialize(context: RuntimeContext): Promise<void>;
  health(): Promise<HealthStatus>;
  shutdown(): Promise<void>;
}

interface Module {
  manifest: ModuleManifest;
  services: Service[];
  capabilities: Capability[];
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

interface Capability {
  id: string;
  name: string;
  version: string;
  permissions: string[];
  dependencies: string[];
}
```

### 1.5 Event System
```typescript
// Built-in event channels
meter.reading.created
meter.status.changed
customer.created
invoice.generated
invoice.issued
invoice.paid
payment.received
payment.reversed
tariff.changed
billrun.completed
alert.triggered
notification.sent
module.installed
plugin.activated
config.changed
```

---

## 2. Plugin Architecture

### 2.1 Plugin Package Format
```
plugin-name/
  manifest.json       # Plugin manifest (required)
  runtime/            # Backend code
    index.js          # Plugin entry point
    services/         # Service definitions
    routes/           # API routes
    models/           # Database models (Prisma schema extensions)
  frontend/           # Frontend extensions
    pages/            # New admin pages
    components/       # UI components
    configs/          # Page configs
  metadata/           # Metadata definitions
    screens.json      # Screen definitions
    forms.json        # Form definitions
    reports.json      # Report definitions
    workflows.json     # Workflow definitions
  assets/             # Static assets
  migrations/         # Database migrations
  tests/              # Plugin tests
```

### 2.2 Plugin Manifest (manifest.json)
```json
{
  "id": "meterverse-plugin-solar",
  "name": "Solar Management",
  "version": "1.0.0",
  "minRuntimeVersion": "8.0.0",
  "dependencies": {
    "meterverse-core": "^8.0.0",
    "meterverse-billing": "^8.0.0"
  },
  "capabilities": [
    "solar.reading.ingest",
    "solar.balance.calculate",
    "solar.invoice.adjust"
  ],
  "permissions": [
    "solar.read",
    "solar.write",
    "solar.admin"
  ],
  "hooks": [
    "invoice.afterGenerate",
    "reading.afterCreate"
  ],
  "database": {
    "tables": ["SolarPanel", "SolarProduction", "SolarCredit"],
    "migrations": "./migrations"
  }
}
```

### 2.3 Plugin States
| State | Description |
|:------|:------------|
| `DISCOVERED` | Plugin detected in filesystem |
| `VALIDATED` | Manifest verified, dependencies checked |
| `INSTALLED` | Database migrations applied |
| `ACTIVATED` | Routes mounted, services started |
| `DISABLED` | Temporarily inactive |
| `UPGRADING` | Version upgrade in progress |
| `ROLLING_BACK` | Version rollback in progress |
| `UNINSTALLED` | Fully removed |

### 2.4 Security Validation
- Every plugin manifest is cryptographically signed
- Plugin code runs in a sandboxed require context
- Database migrations are reviewed before applying
- Permissions are isolated per plugin namespace
- Network access is restricted to declared endpoints

---

## 3. Enterprise Package Manager

### 3.1 Package Types
| Type | Example | Registry |
|:-----|:--------|:---------|
| Core Package | `@meterverse/core` | Built-in |
| Feature Package | `@meterverse/solar` | Internal registry |
| Connector Package | `@meterverse/connector-sap` | Partner registry |
| Report Package | `@meterverse/report-utility` | Report registry |
| Workflow Package | `@meterverse/workflow-approval` | Workflow registry |
| AI Agent Package | `@meterverse/ai-forecast` | AI registry |
| Meter Driver Package | `@meterverse/driver-landis` | Driver registry |

### 3.2 Package Registry API
```http
GET    /api/packages                # List available packages
GET    /api/packages/:id            # Package details
POST   /api/packages/install        # Install package
POST   /api/packages/:id/upgrade    # Upgrade package
POST   /api/packages/:id/rollback   # Rollback package
DELETE /api/packages/:id            # Uninstall package
GET    /api/packages/:id/status     # Package health
GET    /api/packages/updates        # Available updates
```

### 3.3 Dependency Resolution
```
Package A v1.0 depends on Core >=8.0, Billing ^8.0
Package B v2.0 depends on Core >=8.5
→ Resolve: A v1.0 + B v2.0 + Core v8.5 (satisfies both)
→ Conflict detected: A requires Billing ^8.0, B requires nothing → OK
```

---

## 4. Runtime Metadata Engine

### 4.1 Metadata-Driven Architecture
```
Runtime Metadata Engine
  ├── Screen Definitions    → DynamicAdminPage
  ├── Form Definitions      → DynamicForm
  ├── Field Definitions     → DynamicField
  ├── Table Definitions     → DynamicTable
  ├── Workflow Definitions  → WorkflowRuntime
  ├── Report Definitions    → ReportEngine
  ├── Dashboard Definitions → DashboardBuilder
  ├── Chart Definitions     → ChartEngine
  ├── Permission Definitions → PermissionEngine
  ├── Validation Definitions → ValidationEngine
  └── Integration Definitions → IntegrationEngine
```

### 4.2 Metadata Storage (PostgreSQL)
```sql
CREATE TABLE runtime_metadata (
  id UUID PRIMARY KEY,
  type VARCHAR(50),        -- 'screen', 'form', 'field', 'table', 'workflow', 'report', etc.
  key VARCHAR(255),        -- Unique key within type
  name VARCHAR(255),
  description TEXT,
  definition JSONB,        -- The actual metadata definition
  version INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'deprecated'
  plugin_id VARCHAR(255),  -- Source plugin
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ,
  UNIQUE(type, key)
);
```

### 4.3 Dynamic Form Example (Stored as JSON)
```json
{
  "type": "form",
  "key": "customer.create",
  "fields": [
    {"name": "name", "type": "text", "required": true, "maxLength": 200},
    {"name": "email", "type": "email", "required": true, "validation": "email"},
    {"name": "phone", "type": "phone", "country": "EG"},
    {"name": "area", "type": "select", "options": ["October", "New Cairo", "SODIC"]},
    {"name": "status", "type": "select", "options": ["active", "inactive"]}
  ],
  "layout": "vertical",
  "submitEndpoint": "/api/customers"
}
```

### 4.4 Dynamic Table Example
```json
{
  "type": "table",
  "key": "customers.list",
  "columns": [
    {"key": "name", "header": "Name", "type": "avatar", "width": 220},
    {"key": "email", "header": "Email", "type": "email"},
    {"key": "status", "header": "Status", "type": "status", "width": 120}
  ],
  "apiEndpoint": "/api/customers",
  "pagination": true,
  "serverSide": true
}
```

---

## 5. Runtime Governance

### 5.1 Version Control
- Every metadata change creates a new version
- Versions are immutable once created
- Active version is pointed to by `status = 'active'`
- Previous versions remain accessible for rollback

### 5.2 Approval Workflow
```
DRAFT → PENDING_REVIEW → APPROVED → ACTIVE → DEPRECATED
                        → REJECTED → DRAFT
```

### 5.3 Audit Trail
```sql
CREATE TABLE metadata_audit (
  id UUID PRIMARY KEY,
  metadata_id UUID REFERENCES runtime_metadata(id),
  version INT,
  change_type VARCHAR(20),    -- 'create', 'update', 'approve', 'activate', 'rollback'
  previous_definition JSONB,
  new_definition JSONB,
  changed_by VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.4 Deployment Promotion
```
DEV → STAGING → PREPROD → PRODUCTION
Each promotion runs:
1. Schema validation
2. Dependency check
3. Integration test
4. Rollback plan verification
5. Approval gate
```

---

## 6. Implementation Priority

| Component | Priority | Estimated Sessions | Dependencies |
|:----------|:--------:|:------------------:|:-------------|
| Runtime Bootstrap | 🔴 HIGH | 2 | None |
| Service Registry | 🔴 HIGH | 1 | Runtime Bootstrap |
| Event System | 🔴 HIGH | 2 | Service Registry |
| Metadata Engine (core) | 🔴 HIGH | 3 | Runtime Bootstrap |
| Plugin Manifest | 🟡 MEDIUM | 1 | Service Registry |
| Plugin Installer | 🟡 MEDIUM | 2 | Plugin Manifest |
| Package Manager | 🟡 MEDIUM | 3 | Plugin Installer |
| Governance/Versioning | 🟡 MEDIUM | 2 | Metadata Engine |
| Metadata UI (DynamicAdmin) | 🟡 MEDIUM | 4 | Metadata Engine |
| Approval Workflow | 🟢 LOW | 2 | Governance |
| Deployment Promotion | 🟢 LOW | 2 | Approval Workflow |

**Total estimated effort: 24 sessions**
