# 01 — System Inventory

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** Frontend (Next.js) + Backend (NestJS/Prisma)
**Repository:** D:\meter

---

## 1. Frontend Application

**Project:** MeterVerse UI (Next.js 14, TypeScript, RTL-first Arabic)
**Root:** `D:\meter\Frontend\meterverse-ui\`

### 1.1 Pages & Routes (30 files)

| # | Route | File | Component | Type |
|---|-------|------|-----------|------|
| 1 | `/` | `src/app/page.tsx` | `RootLayout` | V1 Dashboard |
| 2 | `/layout` | `src/app/layout.tsx` | Root layout (RTL, providers) | Server |
| 3 | `/providers` | `src/app/providers.tsx` | `Providers` wrapper | Client |
| 4 | `/collections` | `src/app/collections/page.tsx` | `CollectionDashboard` | V1 |
| 5 | `/customers` | `src/app/customers/page.tsx` | `CustomerExplorer` | V1 |
| 6 | `/customers/[id]` | `src/app/customers/[id]/page.tsx` | `CustomerWorkspace` | V1 |
| 7 | `/financial` | `src/app/financial/page.tsx` | `FinancialDashboard` | V1 |
| 8 | `/invoices` | `src/app/invoices/page.tsx` | `InvoiceExplorer` | V1 |
| 9 | `/invoices/[id]` | `src/app/invoices/[id]/page.tsx` | `InvoiceWorkspace` | V1 |
| 10 | `/meters` | `src/app/meters/page.tsx` | `MeterExplorer` | V1 |
| 11 | `/meters/[id]` | `src/app/meters/[id]/page.tsx` | `MeterDetail` | V1 |
| 12 | `/payments` | `src/app/payments/page.tsx` | `PaymentExplorer` | V1 |
| 13 | `/payments/[id]` | `src/app/payments/[id]/page.tsx` | `PaymentWorkspace` | V1 |
| 14 | `/readings` | `src/app/readings/page.tsx` | `ReadingExplorer` | V1 |
| 15 | `/showcase` | `src/app/showcase/page.tsx` | Showcase (all V1 UI + charts) | V1 |
| 16 | `/tariffs` | `src/app/tariffs/page.tsx` | `TariffStudio` | V1 |
| 17 | `/units` | `src/app/units/page.tsx` | `UnitExplorer` | V1 |
| 18 | `/v2` | `src/app/v2/page.tsx` | `GlobalShell` | V2 Root |
| 19 | `/v2/layout` | `src/app/v2/layout.tsx` | V2 root layout | Server |
| 20 | `/v2/customers` | `src/app/v2/customers/page.tsx` | `GlobalShell` | V2 |
| 21 | `/v2/customers/[id]` | `src/app/v2/customers/[id]/page.tsx` | `GlobalShell` | V2 |
| 22 | `/v2/invoices` | `src/app/v2/invoices/page.tsx` | `GlobalShell` | V2 |
| 23 | `/v2/invoices/[id]` | `src/app/v2/invoices/[id]/page.tsx` | `GlobalShell` | V2 |
| 24 | `/v2/meters` | `src/app/v2/meters/page.tsx` | `GlobalShell` | V2 |
| 25 | `/v2/meters/[id]` | `src/app/v2/meters/[id]/page.tsx` | `GlobalShell` | V2 |
| 26 | `/v2/payments` | `src/app/v2/payments/page.tsx` | `GlobalShell` | V2 |
| 27 | `/v2/readings` | `src/app/v2/readings/page.tsx` | `GlobalShell` | V2 |
| 28 | `/v2/settings` | `src/app/v2/settings/page.tsx` | `GlobalShell` | V2 |
| 29 | `/v2/enterprise` | `src/app/v2/enterprise/page.tsx` | `GlobalShell` | V2 |
| 30 | `/v2/design-system` | `src/app/v2/design-system/page.tsx` | V2 Component Catalog | V2 |

**Empty route placeholders:** `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`

### 1.2 V1 Components (`src/components/`) — 116 files, 32 subdirs

| Module | Files | Key Components |
|--------|-------|----------------|
| `ui/` | 48 | Button, Input, Select, Dialog, Drawer, Table, Tooltip, Toast, etc. |
| `customers/` | 12 | CustomerWorkspace, CustomerDetail, CustomerExplorer, CustomerTabs, CustomerKPICards, CustomerHealthWidget, CustomerSmartPanel, CustomerRelationshipPanel, CustomerTimeline, CustomerAlerts, CustomerWorkspaceHeader |
| `experience/` | 12 | HeroSection, MetricCard, StatCard, ChartWrappers (10 types), ActivityTimeline |
| `layout/` | 5 | AppShell, EnterpriseShell, RootLayout, ThemeProvider, TopNavigation |
| `navigation/` | 5 | AdaptiveSidebar, Sidebar, Topbar, BreadcrumbEngine |
| `workspace/` | 4 | WorkspaceManager, WorkspaceSwitcher, WorkspaceShell |
| `invoices/` | 3 | InvoiceExplorer, InvoiceWorkspace |
| `meters/` | 3 | MeterExplorer, MeterDetail |
| `payments/` | 3 | PaymentExplorer, PaymentWorkspace |
| `collections/` | 2 | CollectionDashboard |
| `dashboard/` | 2 | DashboardEngine |
| `financial/` | 2 | FinancialDashboard |
| `readings/` | 2 | ReadingExplorer |
| `search/` | 2 | SearchDialog |
| `shared/` | 2 | SmartTable |
| `state/` | 2 | LoadingSkeleton, EmptyState, ErrorState, PermissionDenied, etc. |
| `tariffs/` | 2 | TariffStudio |
| `units/` | 2 | UnitExplorer |
| `workflow/` | 2 | WorkflowAssistant |
| `notifications/` | 2 | ToastManager |
| `dialog/` | 1 | DialogSystem |
| `loading/` | 1 | Skeleton, TableSkeleton, CardSkeleton, EmptyState, ErrorState, OfflineBanner |
| `notification/` | 1 | ToastContainer |
| `providers/` | 1 | GlobalProviders |
| `page/` | 1 | PageHeader, ActionToolbar, FilterBar |

**Empty directories (7):** `animation/`, `business/`, `gis/`, `ledger/`, `panels/`, `permission/`, `wallet/`

### 1.3 V2 Components (`src/v2/`) — 82 files, ~9,676 lines

| Module | Files | Key Exports |
|--------|-------|-------------|
| `components/ui/` | 36 | Button, IconButton, Input, Textarea, SearchInput, NumberInput, Badge, Chip, Checkbox, RadioGroup, Switch, Select, Avatar, Skeleton, Progress, Tabs, Accordion, Dialog, Drawer, Tooltip, Popover, DropdownMenu, Card, Panel, Breadcrumb, Pagination, Toaster, Alert, EmptyState, ErrorState, LoadingState, OfflineState, PermissionDeniedState, CommandPalette, DataGrid, ContextMenu, MultiSelect, DatePicker, FormField, Label, FormRow, FormSection, ErrorBoundary |
| `components/workspace/` | 7 | GlobalShell (161L), Workspace (178L), CustomerWorkspace (164L), MeterWorkspace (163L), InvoiceCommandCenter (602L), PaymentWorkspace (610L), ReadingWorkspace (636L), EnterpriseAdminCenter (766L) |
| `components/analytics/` | 2 | AnalyticsCard (191L), Charts (224L — bar, line, pie, donut, area, SVG-based) |
| `components/explorer/` | 1 | Explorer (143L — entity explorer sidebar) |
| `components/inspector/` | 1 | Inspector (163L — entity inspector panel) |
| `components/dashboard/` | 1 | Dashboard (421L — KPI cards, charts, system health, pipeline) |
| `components/search/` | 1 | SearchModal (65L — Cmd+Shift+F global search) |
| `components/timeline/` | 1 | Timeline (84L — animated event timeline) |
| `components/layout/` | 2 | Shell, Sidebar |
| `stores/` | 9 | workspace, tabs, selection, search, navigation, layout, explorer, commands (+ index re-export) |
| `repositories/` | 4 | BaseRepository, CustomerRepository, MeterRepository, InvoiceRepository, PaymentRepository, ReadingRepository, EnterpriseRepository, RepositoryCache |
| `data/` | 4 | mock/index.ts (801L — 5 customers, 5 meters, full sub-entities), mock/enterprise-mock.ts (212L — 100+ admin records), fixtures/models.ts (331L — all domain interfaces), fixtures/enterprise-models.ts (110L — 20 admin interfaces) |
| `lib/` | 8 | types.ts, variants.ts (CVA), constants.ts, cn.ts, query/index.ts (React Query-style hooks), query/client.ts (custom query framework 177L), query/cache.ts (71L), api/client.ts (134L — HTTP client) |
| `validators/` | 1 | ensureArray, ensureString, ensureNumber, ensureDate, ensureId, ensureBoolean, ensureRecord |
| `app/` | 2 | layout.tsx, page.tsx (V2Dashboard — 78L) |

**Empty directories (6):** `adapters/`, `contracts/`, `mappers/`, `services/`, `utils/`

### 1.4 Lib (`src/lib/`) — 24 files

| Subdir | Files | Key Exports |
|--------|-------|-------------|
| `api/` | 5 | `http-client.ts` (fetch wrapper), `backend-client.ts` (grouped endpoints), `mock-data.ts` (3 customers, 3 meters, 3 readings, 2 invoices, 1 payment, 3 ledger), `hooks.ts` (13 mock hooks), `hooks-customers.ts` (3 customer hooks + healthScore), `hooks-financial.ts` (10 financial hooks) |
| `stores/` | 3 | `useWorkspaceStore` (112L, persisted), `useThemeStore` (64L, persisted, with high-contrast + direction), `useNotificationStore` (17L, in-memory) |
| `types/` | 2 | `business.ts` (13 type aliases, 12 interfaces — core domain types) |
| `business/` | 3 | `workflow-engine.ts` (singleton, multi-step process manager), `validation-engine.ts` (field + business rules), `status-engine.ts` (16 semantic statuses) |
| `i18n/` | 4 | `translations.ts` (451L, 60+ keys in en/ar), `format.ts` (7 formatting functions), `context.tsx` (LocaleProvider, useLocale, useT) |
| `locale/` | 1 | `locale-store.ts` (27L, persisted locale + direction) |
| `theme/` | 1 | `theme-store.ts` (37L, **duplicate** of stores/theme-store.ts, without high-contrast, with sidebar) |
| `design-tokens/` | 1 | `index.ts` (68L, spacing/radius/typography/shadow/motion tokens) |
| root | 1 | `utils.ts` (6L, `cn()` utility) |

**Empty dirs (4):** `hooks/`, `registry/`, `utils/`, `validation/`

---

## 2. Backend Application

**Project:** meter-verse-backend v25.0.0
**Root:** `D:\meter\Meter\backend\`

### 2.1 Environment

| Property | Value |
|----------|-------|
| Port | 3001 |
| API Prefix | `/api/v1` |
| Database | PostgreSQL 16 on port 5433, DB: `meter_pulse` |
| Schema | 4 schemas: `sim_system`, `core`, `features`, `area` |
| Redis | Port 6379 |
| Auth | JWT (1h access + 7d refresh), bcrypt 12 rounds |
| Swagger | `/api/v1/docs` |

### 2.2 Modules (67 total)

**Domain modules (47):** Admin, Areas, Audit, Auth, BillCycle, Billing, ChilledWater, Collections, Customers, Downloads, Enterprise, Gas, Idempotency, Invoices, KPI, Meters, Notifications, Payments, Portal, Projects, Readings, Registration, Reports, Runtime, RuntimeAPI, RuntimeCapabilities, RuntimeComposer, RuntimeDashboard, RuntimeEventBus, RuntimeGateway, RuntimeGraph, RuntimeIntelligence, RuntimeManifest, RuntimeOperations, RuntimeUI, RuntimeUIDashboard, RuntimeUIManifest, Search, Settings, Settlement, SIMCards, Solar, Support, Sync, Tickets, UnitTypes, Upload, Users, Wallet

**Common modules (13):** Config, Database, Engineering, Errors, Events, HTTP, Logger, Observability, Redis, Secrets, Tenant, Validation, Workers

### 2.3 Prisma Models (137 total across 4 schemas)

| Schema | Model Count | Key Models |
|--------|-------------|------------|
| `sim_system` | 40 | Project, LocationNode, Customer, CustomerUnitAssignment, Meter, SIMCard, MeterAssignment, SIMAssignment, Reading, ReadingReview, TariffPlan, BillingPeriod, Invoice, InvoiceLine, InvoiceAdjustment, Payment, PaymentFee, Cheque, PaymentAllocation, CustomerLedgerEntry, IdempotencyRecord, ProjectThreshold, AuditLog, EventRecord, DeadLetterEvent, ValidationRuleConfig, ReportJob, RefreshToken, LoginAttempt, Notification, ReportTemplate, Ticket, Claim, ClaimDetail, JournalEntry, JournalEntryDetail, TicketComment, SupportRequest, SystemSetting, UploadHistory |
| `core` | 19 | CoreUser, CoreRole, CorePermission, CoreRolePermission, CoreUserRoleAssignment, CoreArea, CoreProject, CoreAuditLog, CoreSystemConfig, CoreNotificationQueue, CorePaymentCenter, CoreBankAccount, CoreHoliday, CoreLocationZone, CoreUnitType, CoreUserGroup, CoreUserRequest, CoreCustomerGroup, CoreSettlement |
| `features` | 34 | Tariff, TariffVersion, TariffCharge, TariffChargeDetail, ReportDefinition, ReportExport, ScheduledJob, ExportHistory, RunningActivity, ContractualRequest, WalletAccount, WalletTransaction, WalletBalance, WalletAllocation, WalletTransfer, ChilledWaterConfig/Reading/Consumption/Invoice/Allocation, SettlementConfig/Period/Rule/Transaction/Allocation, BillingCycle/Project/Approval/Audit, DocumentTemplate/TemplateVersion/GeneratedDocument/DocumentAudit, InvoiceHash/QRCode/GenerationBatch |
| `area` | 36 | AreaCustomer, AreaCustomerMeter, AreaMeterReading, AreaSIMCard, AreaSIMAssignment, AreaMeterStatusLog, AreaReadingReview, AreaReadingThreshold, AreaMeterCalibration, AreaMeterTransfer, AreaInvoiceDetail, AreaTransaction, AreaPaymentAllocation, AreaCustomerLedgerEntry, AreaJournalEntry, AreaPaymentPlan, AreaLateFee, AreaDeposit, AreaRefund, AreaDispute, AreaWaterBalance, AreaSolarWalletTransaction, AreaChilledWaterSettlement, AreaUsageSummary, AreaAlert, AreaChatMessage, AreaTask, AreaApproval, AreaAttachment, AreaTroubleTicket, AreaCollectionAction, AreaContract, AreaSubscription, AreaWorkOrder, AreaOTPCode, AreaApiKey, AreaWebhookSubscription, AreaPaymentGatewayLog, AreaIntegrationLog, AreaDataSyncTracker, AreaSchemaVersion, AreaUserSession |

### 2.4 Auth & Security

- **Guards:** ThrottlerGuard, GlobalAuthGuard, AreaGuard, RolesGuard, PermissionsGuard (all global)
- **Interceptors:** AuditInterceptor, EventInterceptor, ProjectAccessInterceptor
- **Middleware:** CorrelationMiddleware, AccessContextMiddleware
- **Strategies:** JWT Strategy

### 2.5 Key Backend-Facing Files

- Swagger/OpenAPI: `src/common/openapi/openapi.setup.ts`
- External API Spec: `docs/previous-plans/specs/001/contracts/meter-pulse-api.yaml` (OpenAPI 3.1.0, 564 lines)
- Contract Tests: `test/contract/` (12 spec files: meter-assign, meter-terminate, sim-eligibility, reading-create, reading-review-queue, invoice-generate, invoice-issue, invoice-adjustment, payments, statement)

---

## 3. Cross-Cutting Concerns

### 3.1 State Management Duality

| Concern | V1 (src/lib/stores/) | V2 (src/v2/stores/) |
|---------|---------------------|---------------------|
| Workspace | `useWorkspaceStore` (persisted, 112L) | `useWorkspace` (composition of 6 sub-stores) |
| Theme | `useThemeStore` (stores/) + duplicate at `theme/` | Global CSS variables |
| Notifications | `useNotificationStore` (17L, in-memory) | Sonner Toaster (V2 UI) |
| Search | N/A | `useSearch` + `useCommandPalette` stores |
| Tabs | N/A | `useTabsStore` (max 10, auto-evict) |
| Explorer | N/A | `useExplorerStore` (filters, density, sort) |
| Layout | N/A | `useLayoutStore` (panel widths) |
| Navigation | `currentPage` in workspace | `useNavigationStore` (recent history) |

### 3.2 Data Layer Duality

| Concern | V1 | V2 |
|---------|-----|-----|
| HTTP Client | `lib/api/http-client.ts` | `v2/lib/api/client.ts` (ApiClient class) |
| API Endpoints | `lib/api/backend-client.ts` | Repository classes |
| Mock Data | `lib/api/mock-data.ts` (minimal) | `v2/data/mock/index.ts` (massive, 801L) |
| Data Hooks | `lib/api/hooks*.ts` (useMemo wrappers) | `v2/lib/query/index.ts` (QueryClient framework) |
| Domain Types | `lib/types/business.ts` (113L) | `v2/data/fixtures/models.ts` (331L, more detailed) |

### 3.3 Design System Duality

| Component | V1 (`src/components/ui/`) | V2 (`src/v2/components/ui/`) |
|-----------|---------------------------|------------------------------|
| Button | ~55L, 6 variants | ~27L, 4 variants + Slot |
| Input | ~43L, with label/error | ~33L, basic |
| Dialog | ~33L, basic | ~69L, Radix-based, full suite |
| Dropdown | ~32L, basic | ~185L, Radix full suite |
| Table | `SmartTable` (156L) | `DataGrid` (118L, TanStack) |
| Search | `SearchDialog` (108L) | `SearchInput` (47L) + `CommandPalette` (90L) |
| Select | ~30L, native | ~120L, Radix full suite |
| Context Menu | ~36L, basic | ~173L, Radix full suite |
| Toast | `ToastContainer` (26L) | Sonner-based Toaster (31L) |
| Skeleton | ~36L, 4 variants | ~21L, basic |
| Charts | 10 chart types (Recharts) | 4 chart types (SVG-based) |
| DatePicker | ~32L, native | ~55L, react-day-picker |
| States | ~71L (6 components) | ~93L (5 components, framer-motion) |
