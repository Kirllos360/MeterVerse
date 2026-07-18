# MeterVerse Event & Message Bus

**Phase**: 16D  
**Status**: Architecture Definition  
**Dependencies**: Phase 16A (Runtime Kernel), Phase 16B (Workspace Engine), Phase 16C (Registry Engine)  
**Mission**: Every subsystem communicates through events. Nothing knows about anything else.

---

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              EVENT BUS                   │
                    │                                          │
                    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
                    │  │ Domain   │  │   UI     │  │ Plugin │ │
                    │  │ Events   │  │  Events  │  │ Events │ │
                    │  └──────────┘  └──────────┘  └────────┘ │
                    │                                          │
                    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
                    │  │ System   │  │  Timer   │  │  User  │ │
                    │  │ Events   │  │  Events  │  │ Events │ │
                    │  └──────────┘  └──────────┘  └────────┘ │
                    │                                          │
                    │  ┌─────────┐  ┌──────────┐  ┌────────┐ │
                    │  │  Event  │  │  Event   │  │  Event │ │
                    │  │ History │  │ Replay   │  │Filtering│ │
                    │  └─────────┘  └──────────┘  └────────┘ │
                    │                                          │
                    │  ┌─────────┐  ┌──────────┐  ┌────────┐ │
                    │  │  Event  │  │  Event   │  │  Event │ │
                    │  │ Persist.│  │Versioning│  │  Debug │ │
                    │  └─────────┘  └──────────┘  └────────┘ │
                    └─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   Runtime Kernel         Workspace Engine         Registry Engine
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │     Applications       │
                    │  Billing │ Customers   │
                    │  Meters  │ Reports     │
                    │  AI      │ Monitoring  │
                    └───────────────────────┘
```

---

## Part 1: Event Bus Core

The Event Bus is the central nervous system. Every subsystem publishes and subscribes through it.

```typescript
interface EventBus {
  /** Unique bus identifier */
  readonly id: string
  
  /** Bus version */
  readonly version: string
  
  /** All channels */
  readonly channels: Map<string, EventChannel>
  
  // Core publish/subscribe
  publish<T>(event: DomainEvent<T>): Promise<PublishedEvent>
  subscribe<T>(eventType: string, handler: EventHandler<T>, options?: SubscribeOptions): Subscription
  unsubscribe(subscription: Subscription): void
  
  // Channel-based
  channel(name: string): EventChannel
  
  // Filtering
  withFilter(filter: EventFilter): FilteredEventBus
  
  // Priority
  setPriority(eventType: string, priority: number): void
  
  // Lifecycle
  initialize(): Promise<void>
  dispose(): Promise<void>
  
  // Stats
  stats(): BusStats
}
```

### Event Channel

```typescript
interface EventChannel {
  /** Channel name */
  readonly name: string
  
  /** Channel description */
  readonly description?: string
  
  /** Channel type */
  readonly type: ChannelType
  
  // Publish/Subscribe scoped to this channel
  publish<T>(event: DomainEvent<T>): Promise<PublishedEvent>
  subscribe<T>(eventType: string, handler: EventHandler<T>, options?: SubscribeOptions): Subscription
  
  /** Number of subscribers */
  subscriberCount: number
  
  /** Events published through this channel */
  eventCount: number
}

type ChannelType = 
  | "domain"    // Business events (MeterAssigned, InvoiceGenerated)
  | "ui"        // UI events (TabOpened, PanelResized)  
  | "system"    // System events (RuntimeStarted, ConfigChanged)
  | "plugin"    // Plugin lifecycle events
  | "timer"     // Scheduled/timer events
  | "user"      // User action events
```

---

## Part 2: Event Envelope

Every event has a standardized envelope.

```typescript
interface EventEnvelope<T = unknown> {
  /** Unique event ID (UUID v7 — time-sortable) */
  readonly id: string
  
  /** Event type (reverse-domain: "meter.assigned.v1") */
  readonly type: string
  
  /** Event version */
  readonly version: number
  
  /** When the event occurred */
  readonly timestamp: number
  
  /** Who published the event */
  readonly source: EventSource
  
  /** The event payload */
  readonly payload: T
  
  /** Metadata for routing/filtering */
  readonly metadata: EventMetadata
  
  /** Previous event in a causal chain */
  readonly causationId?: string
  
  /** Correlation ID for tracing across events */
  readonly correlationId: string
  
  /** Priority (higher = processed first) */
  readonly priority: number
  
  /** Schema version for migration */
  readonly schemaVersion: number
}

interface EventSource {
  /** Source identifier */
  id: string
  
  /** Source type */
  type: "runtime" | "workspace" | "registry" | "program" | "plugin" | "user" | "system"
  
  /** Human-readable source name */
  name: string
  
  /** Source version */
  version?: string
}

interface EventMetadata {
  /** Event category for grouping */
  category?: string
  
  /** Tags for filtering */
  tags?: string[]
  
  /** Whether this event should be persisted */
  persist?: boolean  // default: true
  
  /** Whether this event should be replayable */
  replayable?: boolean  // default: true
  
  /** Time-to-live in seconds (0 = forever) */
  ttl?: number  // default: 0
  
  /** Event size in bytes */
  size?: number
  
  /** Processing duration in ms (filled after processing) */
  processingDuration?: number
}
```

---

## Part 3: Domain Events

Domain events represent business operations that happened.

```typescript
// ─── Meter Domain Events ───

interface MeterAssignedPayload {
  meterId: string
  meterSerial: string
  customerId: string
  customerName: string
  unitId: string
  assignedAt: string
  assignedBy: string
}

interface MeterReadingRecordedPayload {
  meterId: string
  meterSerial: string
  readingId: string
  readingValue: number
  readingAt: string
  source: "manual" | "import" | "automatic"
  anomaly: boolean
}

interface MeterStatusChangedPayload {
  meterId: string
  meterSerial: string
  previousStatus: string
  newStatus: string
  reason?: string
  changedAt: string
}

// ─── Customer Domain Events ───

interface CustomerCreatedPayload {
  customerId: string
  customerCode: string
  customerName: string
  customerType: string
  projectId: string
}

interface CustomerBalanceChangedPayload {
  customerId: string
  previousBalance: number
  newBalance: number
  delta: number
  reason: string
}

// ─── Billing Domain Events ───

interface InvoiceGeneratedPayload {
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  periodStart: string
  periodEnd: string
  meterIds: string[]
}

interface InvoicePaidPayload {
  invoiceId: string
  invoiceNumber: string
  paymentId: string
  amount: number
  paidAt: string
  paymentMethod: string
}

interface PaymentRecordedPayload {
  paymentId: string
  paymentNumber: string
  customerId: string
  amount: number
  method: string
  status: string
}

// ─── Reading Domain Events ───

interface ReadingAnomalyDetectedPayload {
  readingId: string
  meterId: string
  meterSerial: string
  readingValue: number
  expectedRange: { min: number; max: number }
  anomalyType: "spike" | "drop" | "zero" | "negative" | "exceeds_threshold"
  severity: "low" | "medium" | "high"
}

// ─── Alert Domain Events ───

interface AlertTriggeredPayload {
  alertId: string
  alertType: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  entityType: string
  entityId: string
  triggeredAt: string
}
```

### Domain Event Registry

```typescript
// All domain events registered for schema validation and documentation
const DOMAIN_EVENTS = {
  // Meter events
  "meter.assigned.v1":            { schema: MeterAssignedPayload,      category: "meter",      replayable: true },
  "meter.reading.recorded.v1":    { schema: MeterReadingRecordedPayload, category: "meter",    replayable: true },
  "meter.status.changed.v1":      { schema: MeterStatusChangedPayload,  category: "meter",    replayable: true },
  "meter.anomaly.detected.v1":    { schema: ReadingAnomalyDetectedPayload, category: "meter", replayable: true },
  
  // Customer events
  "customer.created.v1":          { schema: CustomerCreatedPayload,        category: "customer", replayable: true },
  "customer.balance.changed.v1":  { schema: CustomerBalanceChangedPayload, category: "customer", replayable: true },
  
  // Billing events
  "invoice.generated.v1":         { schema: InvoiceGeneratedPayload, category: "billing", replayable: true },
  "invoice.paid.v1":              { schema: InvoicePaidPayload,      category: "billing", replayable: true },
  "payment.recorded.v1":          { schema: PaymentRecordedPayload,  category: "billing", replayable: true },
  
  // Alert events
  "alert.triggered.v1":           { schema: AlertTriggeredPayload,   category: "alert",   replayable: false },
}
```

---

## Part 4: UI Events

UI events represent user interface interactions.

```typescript
// ─── Workspace UI Events ───

interface TabOpenedPayload { programId: string; tabId: string; type: "program" | "temporary" }
interface TabClosedPayload { tabId: string; programId: string }
interface TabFocusedPayload { tabId: string; programId: string }
interface SplitCreatedPayload { direction: "horizontal" | "vertical"; panelIds: string[] }
interface SplitResizedPayload { dividerIndex: number; position: number }
interface FloatingWindowOpenedPayload { windowId: string; programId: string }
interface DockModeChangedPayload { mode: DockMode }

// ─── Selection UI Events ───

interface SelectionChangedPayload { 
  entityType: string; entityIds: string[]; source: string 
}
interface SelectionClearedPayload { source: string }

// ─── Inspector UI Events ───

interface InspectorOpenedPayload { entityType: string; entityId: string }
interface InspectorClosedPayload {}
interface PanelExpandedPayload { panelId: string }
interface PanelCollapsedPayload { panelId: string }

// ─── Search UI Events ───

interface SearchPerformedPayload { query: string; category: string; resultCount: number }
interface SearchResultActivatedPayload { resultId: string; resultType: string }

// ─── View UI Events ───

interface ViewModeChangedPayload { mode: "list" | "grid"; programId: string }
interface ColumnSortedPayload { columnId: string; direction: "asc" | "desc" }
interface ColumnFilteredPayload { columnId: string; filter: unknown }
```

---

## Part 5: System Events

System events represent runtime infrastructure events.

```typescript
// ─── Runtime Lifecycle ───

interface RuntimeInitializedPayload { version: string; sessionId: string; timestamp: number }
interface RuntimeSuspendingPayload { reason: string }
interface RuntimeResumedPayload { sessionId: string }
interface RuntimeShutdownPayload { reason: string; uptime: number }

// ─── Workspace Lifecycle ───

interface WorkspaceCreatedPayload { workspaceId: string }
interface WorkspaceLayoutChangedPayload { layoutId: string }
interface WorkspaceRestoredPayload { workspaceId: string; programCount: number }

// ─── Registry Events ───

interface RegistryItemRegisteredPayload { 
  registryId: string; itemId: string; itemType: string 
}
interface RegistryItemUnregisteredPayload { 
  registryId: string; itemId: string; itemType: string 
}

// ─── Plugin Events ───

interface PluginInstalledPayload { pluginId: string; version: string }
interface PluginUninstalledPayload { pluginId: string }
interface PluginEnabledPayload { pluginId: string }
interface PluginDisabledPayload { pluginId: string }
interface PluginErrorPayload { pluginId: string; error: string }

// ─── Performance Events ───

interface PerformanceWarningPayload { 
  metric: string; value: number; threshold: number; context: string 
}
interface ErrorLoggedPayload { 
  errorId: string; message: string; stack?: string; severity: "error" | "warning" 
}

// ─── Configuration Events ───

interface ConfigurationChangedPayload { key: string; previousValue?: unknown; newValue: unknown }
interface ThemeChangedPayload { themeId: string; mode: "light" | "dark" }
interface LanguageChangedPayload { locale: string }
```

---

## Part 6: Plugin Events

Plugin events represent plugin lifecycle and custom plugin-published events.

```typescript
// ─── Plugin Lifecycle Events ───

interface PluginLifecyclePayload {
  pluginId: string
  pluginName: string
  version: string
  timestamp: number
}

// ─── Custom Plugin Events ───

interface PluginCustomEvent<T = unknown> {
  /** Plugin that owns this event type */
  pluginId: string
  
  /** Custom event type (namespaced: "plugin:myplugin:customEvent") */
  readonly type: string
  
  /** Event payload */
  readonly payload: T
  
  /** Schema URL for validation */
  readonly schemaUrl?: string
}

// Plugins publish events through the bus
// pluginBus.publish("plugin:reporting:exportCompleted", { exportId: "123", format: "pdf" })
```

### Plugin Event Namespacing

```
Plugin events follow this naming convention:
plugin:{pluginId}:{eventName}:v{version}

Examples:
plugin:reporting:exportCompleted:v1
plugin:ai:anomalyDetected:v2
plugin:integration:syncCompleted:v1
```

---

## Part 7: Event Subscription & Filtering

```typescript
interface SubscribeOptions {
  /** Subscribe once then auto-unsubscribe */
  once?: boolean
  
  /** Only receive events matching filter */
  filter?: EventFilter
  
  /** Subscribe to a specific channel */
  channel?: string
  
  /** Minimum priority to receive (lower = more important) */
  minPriority?: number
  
  /** Only events from specific sources */
  sourceIds?: string[]
  
  /** Transform event before handler receives it */
  transform?: (event: EventEnvelope) => EventEnvelope
  
  /** Throttle handler (ms between calls) */
  throttle?: number
  
  /** Debounce handler (ms wait after last event) */
  debounce?: number
  
  /** Error handler for this subscription */
  onError?: (error: Error, event: EventEnvelope) => void
}

interface EventFilter {
  /** Include only these event types */
  types?: string[]
  
  /** Exclude these event types */
  excludeTypes?: string[]
  
  /** Include only these categories */
  categories?: string[]
  
  /** Custom predicate function */
  predicate?: (event: EventEnvelope) => boolean
  
  /** Filter by tags (event must have ALL specified tags) */
  tags?: string[]
  
  /** Filter by source types */
  sourceTypes?: EventSource["type"][]
  
  /** Filter by priority range */
  priorityRange?: { min?: number; max?: number }
  
  /** Time range filter */
  timeRange?: { after?: number; before?: number }
}

interface Subscription {
  /** Unique subscription ID */
  id: string
  
  /** Event type subscribed to */
  eventType: string
  
  /** Whether subscription is active */
  active: boolean
  
  /** Pause receiving events */
  pause(): void
  
  /** Resume receiving events */
  resume(): void
  
  /** Unsubscribe */
  unsubscribe(): void
}
```

### Filtered Event Bus

```typescript
class FilteredEventBus implements EventBus {
  constructor(private parent: EventBus, private filter: EventFilter) {}
  
  async publish<T>(event: DomainEvent<T>): Promise<PublishedEvent> {
    // Filter applies to publishing too
    if (this.filter.predicate && !this.filter.predicate(event as unknown as EventEnvelope)) {
      return { id: event.id, filtered: true }
    }
    return this.parent.publish(event)
  }
  
  subscribe<T>(eventType: string, handler: EventHandler<T>, options?: SubscribeOptions): Subscription {
    return this.parent.subscribe(eventType, handler, { ...options, filter: this.filter })
  }
}

// Usage:
// const meterEvents = bus.withFilter({ categories: ["meter"] })
// meterEvents.subscribe("meter.assigned.v1", handler)
```

---

## Part 8: Event Priorities

```typescript
enum EventPriority {
  CRITICAL = 0,    // System health, security events — processed first
  HIGH     = 100,  // User-facing operations, domain events
  NORMAL   = 500,  // Standard events (default)
  LOW      = 900,  // Analytics, telemetry, logging
  BACKGROUND = 999 // Indexing, cache warming, cleanup
}

interface PriorityQueue {
  /** Enqueue an event with priority */
  enqueue(event: EventEnvelope): void
  
  /** Dequeue the highest priority event */
  dequeue(): EventEnvelope | undefined
  
  /** Peek at highest priority event without removing */
  peek(): EventEnvelope | undefined
  
  /** Queue length */
  length: number
  
  /** Process events in priority order */
  process(handler: (event: EventEnvelope) => Promise<void>): Promise<void>
}
```

### Priority Processing Rules

1. Events are processed in strict priority order within the same millisecond
2. Within the same priority, events are processed FIFO
3. CRITICAL events interrupt current processing (preemptive)
4. HIGH events queue behind CRITICAL but preempt NORMAL
5. BACKGROUND events only process when queue is idle

---

## Part 9: Event Versioning

```typescript
interface EventVersionManager {
  /** Current schema version */
  readonly currentSchemaVersion: number
  
  /** All known versions */
  readonly versions: EventVersion[]
  
  /** Migrate event from one version to another */
  migrate(event: EventEnvelope, fromVersion: number, toVersion: number): EventEnvelope
  
  /** Auto-migrate event to latest version */
  migrateToLatest(event: EventEnvelope): EventEnvelope
  
  /** Check if migration is needed */
  needsMigration(event: EventEnvelope): boolean
  
  /** Register a migration */
  registerMigration(fromVersion: number, toVersion: number, migrator: EventMigrator): void
}

interface EventVersion {
  version: number
  changes: string
  deprecated: boolean
  migratedFrom?: number[]
}

type EventMigrator = (payload: unknown) => unknown

// Example: migrate meter.assigned from v1 to v2
eventVersionManager.registerMigration(1, 2, (payload) => {
  const old = payload as MeterAssignedPayloadV1
  return {
    meterId: old.meterId,
    meterSerial: old.meterSerial,
    customerId: old.customerId,
    customerName: old.customerName,
    unitId: old.unitId,
    assignedAt: old.assignedAt,
    assignedBy: old.assignedBy,
    // NEW in v2: added assignedByRole field
    assignedByRole: "operator",
  }
})
```

### Versioning Convention

```
Event types are versioned in the type name:
meter.assigned.v1
meter.assigned.v2

Breaking changes → increment major version
Additive changes → same version, optional fields
Deprecation → keep old version, add new, log warning
```

---

## Part 10: Event Persistence

```typescript
interface EventStore {
  /** Store an event */
  store(event: EventEnvelope): Promise<void>
  
  /** Store multiple events (batch) */
  storeBatch(events: EventEnvelope[]): Promise<void>
  
  /** Get event by ID */
  get(eventId: string): Promise<EventEnvelope | null>
  
  /** Query events */
  query(query: EventQuery): Promise<EventEnvelope[]>
  
  /** Count events matching query */
  count(query: EventQuery): Promise<number>
  
  /** Get events by correlation ID */
  getByCorrelationId(correlationId: string): Promise<EventEnvelope[]>
  
  /** Get events by type */
  getByType(eventType: string, options?: QueryOptions): Promise<EventEnvelope[]>
  
  /** Get events within time range */
  getByTimeRange(from: number, to: number, options?: QueryOptions): Promise<EventEnvelope[]>
  
  /** Delete old events (for TTL/pruning) */
  prune(before: number): Promise<number>
  
  /** Get storage stats */
  stats(): EventStoreStats
}

interface EventQuery {
  types?: string[]
  categories?: string[]
  sourceIds?: string[]
  correlationId?: string
  causationId?: string
  fromTimestamp?: number
  toTimestamp?: number
  priority?: { min?: number; max?: number }
  tags?: string[]
  limit?: number
  offset?: number
  orderBy?: "timestamp" | "priority"
  orderDirection?: "asc" | "desc"
}

interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: "asc" | "desc"
}

interface EventStoreStats {
  totalEvents: number
  oldestEvent: number
  newestEvent: number
  storageSize: number  // bytes
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
}

// Storage backends
interface InMemoryEventStore extends EventStore {
  // Fast, non-persistent — for development / debugging
}

interface LocalStorageEventStore extends EventStore {
  // Persisted to localStorage, survives restart
  // Limited to ~5MB total
}

interface IndexedDBEventStore extends EventStore {
  // Persisted to IndexedDB, large capacity
  // Supports complex queries via indexes
}
```

---

## Part 11: Event Replay

```typescript
interface EventReplay {
  /** Replay events from store */
  replay(options: ReplayOptions): Promise<ReplayResult>
  
  /** Replay a single event */
  replayEvent(eventId: string): Promise<void>
  
  /** Replay events by type */
  replayByType(eventType: string, options?: ReplayOptions): Promise<ReplayResult>
  
  /** Replay events by correlation ID */
  replayByCorrelationId(correlationId: string): Promise<ReplayResult>
  
  /** Replay events by time range */
  replayByTimeRange(from: number, to: number, options?: ReplayOptions): Promise<ReplayResult>
  
  /** Subscribe to replay progress */
  onProgress: Event<ReplayProgress>
  
  /** Cancel active replay */
  cancel(): Promise<void>
}

interface ReplayOptions {
  /** Event types to replay (empty = all) */
  types?: string[]
  
  /** Filter predicate */
  filter?: EventFilter
  
  /** Speed: "fastest" | "instant" | number (ms between events) */
  speed?: "fastest" | "instant" | number
  
  /** Whether to process side effects */
  processSideEffects?: boolean  // default: true
  
  /** Whether to skip errors */
  skipErrors?: boolean  // default: false
  
  /** Max events to replay */
  limit?: number
  
  /** Time range */
  fromTimestamp?: number
  toTimestamp?: number
}

interface ReplayResult {
  totalEvents: number
  replayedEvents: number
  failedEvents: number
  errors: ReplayError[]
  duration: number  // ms
}

interface ReplayProgress {
  total: number
  replayed: number
  failed: number
  percentage: number
  currentEventId: string
}

interface ReplayError {
  eventId: string
  eventType: string
  error: string
  skipped: boolean
}
```

### Replay Use Cases

```
1. Workspace Restore
   After browser restart → replay last N events → rebuild workspace state
   
2. Audit Investigation
   Select time range → replay all events → trace what happened
   
3. Plugin Sync
   New plugin installed → replay relevant events → build plugin state
   
4. Debugging
   Capture event sequence → replay with debugger → step through events
   
5. Migration
   Old events → replay through new migrators → populate new data structures
```

---

## Part 12: Event History

```typescript
interface EventHistory {
  /** Record an event in history */
  record(event: EventEnvelope): Promise<void>
  
  /** Get event history */
  getHistory(options?: HistoryQuery): Promise<HistoryEntry[]>
  
  /** Get event timeline (grouped by time) */
  getTimeline(options?: TimelineOptions): Promise<TimelineEntry[]>
  
  /** Search history */
  search(query: string, options?: HistoryQuery): Promise<HistoryEntry[]>
  
  /** Get aggregate stats */
  getStats(options?: HistoryQuery): HistoryStats
  
  /** Get event flow graph (causation chains) */
  getEventFlow(correlationId: string): EventFlowGraph
  
  /** Clear history */
  clear(): Promise<void>
}

interface HistoryEntry {
  event: EventEnvelope
  processedAt: number
  processingDuration: number
  subscriberCount: number
  errors: string[]
}

interface HistoryQuery {
  types?: string[]
  categories?: string[]
  fromTimestamp?: number
  toTimestamp?: number
  limit?: number
  offset?: number
}

interface TimelineEntry {
  timeBucket: string  // "2026-07-18T10:00:00"
  events: EventEnvelope[]
  count: number
}

interface HistoryStats {
  totalEvents: number
  uniqueTypes: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  avgProcessingDuration: number
  errorRate: number
  busiestHour: string
}

interface EventFlowGraph {
  nodes: EventFlowNode[]
  edges: EventFlowEdge[]
}

interface EventFlowNode {
  id: string
  type: string
  timestamp: number
  source: string
}

interface EventFlowEdge {
  from: string  // causationId
  to: string    // eventId
  relationship: "causes" | "respondsTo" | "derivesFrom"
}
```

---

## Part 13: Event Debugger

```typescript
interface EventDebugger {
  /** Whether debugger is active */
  readonly active: boolean
  
  /** All intercepted events */
  readonly capturedEvents: CapturedEvent[]
  
  /** Start capturing */
  start(): void
  
  /** Stop capturing */
  stop(): void
  
  /** Clear captured events */
  clear(): void
  
  /** Get captured events matching filter */
  getCaptured(filter?: EventFilter): CapturedEvent[]
  
  /** Breakpoint on specific event type */
  addBreakpoint(eventType: string, condition?: (event: EventEnvelope) => boolean): void
  removeBreakpoint(eventType: string): void
  listBreakpoints(): string[]
  
  /** Step through events (pause after each) */
  stepMode: boolean
  stepForward(): Promise<CapturedEvent>
  stepBackward(): Promise<CapturedEvent>
  
  /** Export captured events */
  export(): CapturedEvent[]
  import(events: CapturedEvent[]): void
}

interface CapturedEvent {
  event: EventEnvelope
  capturedAt: number
  subscriberResults: {
    subscriberId: string
    duration: number
    error?: string
  }[]
  queueDuration: number  // time from publish to first subscriber
  totalDuration: number   // time from publish to all subscribers complete
}
```

---

## Part 14: Event Inspector

The Event Inspector is a developer tool for visualizing event flow.

```typescript
interface EventInspector {
  /** Open the inspector panel */
  open(): void
  
  /** Close the inspector panel */
  close(): void
  
  /** Filter displayed events */
  setFilter(filter: EventFilter): void
  
  /** Highlight specific event type */
  highlightEventType(eventType: string): void
  
  /** Show event flow diagram */
  showFlow(correlationId: string): void
  
  /** Show event details */
  showEvent(eventId: string): void
  
  /** Export event log */
  exportLog(format: "json" | "csv"): Blob
}

// Event Inspector UI renders:
// ┌──────────────────────────────────────────┐
// │  Event Inspector                         │
// ├──────────────────────────────────────────┤
// │  🔴 meter.assigned.v1                    │
// │     Meter #M-1234 assigned to Customer X │
// │     ⏱ 10ms │ 📦 2KB │ 🔄 4 subscribers │
// │  🟡 invoice.generated.v1                 │
// │     Invoice #INV-5678 for $1,234.56      │
// │     ⏱ 45ms │ 📦 3KB │ 🔄 6 subscribers │
// │  🟢 meter.reading.recorded.v1            │
// │     Meter #M-9012: reading 123.45 kWh    │
// │     ⏱ 8ms │ 📦 1KB │ 🔄 3 subscribers   │
// ├──────────────────────────────────────────┤
// │  Stats: 1,247 events | 23 types | 0 err  │
// └──────────────────────────────────────────┘
```

---

## Part 15: Event Recorder

The Event Recorder captures events for testing and debugging.

```typescript
interface EventRecorder {
  /** Start recording */
  start(): void
  
  /** Stop recording */
  stop(): Promise<Recording>
  
  /** Pause recording */
  pause(): void
  
  /** Resume recording */
  resume(): void
  
  /** Whether recording */
  readonly isRecording: boolean
  
  /** Current recording session */
  readonly session: RecordingSession | null
  
  /** Record to a specific store */
  setStore(store: EventStore): void
}

interface Recording {
  id: string
  startedAt: number
  endedAt: number
  events: EventEnvelope[]
  metadata: RecordingMetadata
}

interface RecordingSession {
  id: string
  startedAt: number
  eventCount: number
  size: number
}

interface RecordingMetadata {
  name: string
  description?: string
  environment: string
  version: string
  tags?: string[]
}
```

---

## Part 16: Event Contracts

Every event type has a contract that defines its schema, semantics, and behavior.

```typescript
interface EventContract {
  /** Event type */
  type: string
  
  /** Current version */
  version: number
  
  /** Event description */
  description: string
  
  /** Event category */
  category: string
  
  /** Schema definition (JSON Schema) */
  schema: Record<string, unknown>
  
  /** Example payload */
  example: unknown
  
  /** Who publishes this event */
  publisher: EventSource
  
  /** Expected subscribers */
  subscribers?: string[]
  
  /** Whether event is replayable */
  replayable: boolean
  
  /** Whether event should be persisted */
  persist: boolean
  
  /** Default priority */
  priority: EventPriority
  
  /** Tags */
  tags?: string[]
  
  /** Deprecation info */
  deprecated?: { since: string; alternative?: string }
}
```

### Contract Registry

```typescript
interface EventContractRegistry {
  /** Register an event contract */
  register(contract: EventContract): void
  
  /** Get contract for event type */
  get(type: string, version?: number): EventContract | undefined
  
  /** Validate event against its contract */
  validate(event: EventEnvelope): ValidationResult
  
  /** Get all contracts */
  getAll(): EventContract[]
  
  /** Get contracts by category */
  getByCategory(category: string): EventContract[]
  
  /** Get deprecated contracts */
  getDeprecated(): EventContract[]
}

// All domain events register their contracts
eventContractRegistry.register({
  type: "meter.assigned.v1",
  version: 1,
  description: "A meter has been assigned to a customer unit",
  category: "meter",
  schema: { /* JSON Schema */ },
  example: { meterId: "m-123", customerId: "c-456", /* ... */ },
  publisher: { id: "program:meters", type: "program", name: "Meters Program" },
  subscribers: ["Workspace", "Inspector", "Dashboard", "Notifications", "Audit"],
  replayable: true,
  persist: true,
  priority: EventPriority.HIGH,
  tags: ["meter", "assignment", "domain"],
})
```

---

## Part 17: Architecture Integration

### Runtime → Event Bus → Everything

```
                ┌──────────────────────────────────────┐
                │            EVENT BUS                  │
                │                                       │
                │  ┌─────────────────────────────────┐  │
                │  │         Event Channels           │  │
                │  │  Domain │ UI │ System │ Plugin   │  │
                │  └─────────────────────────────────┘  │
                │                                       │
                │  ┌─────────────────────────────────┐  │
                │  │      Event Infrastructure        │  │
                │  │  Store │ Replay │ History │ Debug │  │
                │  └─────────────────────────────────┘  │
                └──────────────────────────────────────┘
                           │        │        │
              ┌────────────┘        │        └────────────┐
              │                     │                     │
         Runtime              Workspace              Registry
         Kernel               Engine                 Engine
              │                     │                     │
         Publishes:           Publishes:             Publishes:
         • RuntimeEvents      • TabOpened            • RegistryChanged
         • SystemEvents       • SplitCreated         • PluginLifecycle
         • PerformanceEvents  • SelectionChanged     • PermissionChanged
              │                     │                     │
         Subscribes to:       Subscribes to:        Subscribes to:
         • DomainEvents       • MeterAssigned       • MeterAssigned
         • PluginEvents       • InvoiceGenerated    • UI:SelectionChanged
         • ConfigEvents       • AlertTriggered      • System:RuntimeShutdown
              │                     │                     │
         ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
         │Programs │          │  Dock   │          │Registry │
         │Windows  │          │  Split  │          │Manager  │
         │Focus    │          │  Tabs   │          │Discovery│
         │History  │          │  Layout │          │Plugins  │
         └─────────┘          └─────────┘          └─────────┘
```

### Event Flow Example: Meter Assigned

```
1. User assigns meter in Meters program
         │
2. Meters program publishes event:
   bus.publish("meter.assigned.v1", payload)
         │
         ▼
3. Event Bus receives, wraps in envelope:
   - Assigns event ID (UUID v7)
   - Records timestamp
   - Sets correlation ID
   - Stores in EventStore
         │
         ▼
4. Event Bus dispatches to subscribers:
         │
         ├──▶ Workspace Engine (Explorer refresh)
         │      Updates meter tree, marks node as assigned
         │
         ├──▶ Inspector (Context Panel refresh)
         │      If meter is selected, refreshes meter details
         │
         ├──▶ Dashboard (Widget refresh)
         │      If meter status widget is open, updates count
         │
         ├──▶ Notifications
         │      Shows toast: "Meter M-1234 assigned to Customer X"
         │
         ├──▶ Audit Log
         │      Records: who assigned what meter to which customer
         │
         ├──▶ Reports (if reporting is open for this area)
         │      Updates pending report data
         │
         ├──▶ AI (anomaly detection)
         │      Checks if this assignment is anomalous
         │
         └──▶ Plugins
                Any plugin subscribed to meter.assigned fires
```

---

## Part 18: Implementation Guidelines

### File Structure
```
src/event-bus/
├── core/
│   ├── bus.ts              # EventBus implementation
│   ├── channel.ts          # EventChannel implementation
│   ├── envelope.ts         # EventEnvelope factory
│   ├── priority.ts         # PriorityQueue
│   ├── filter.ts           # EventFilter + FilteredEventBus
│   └── subscription.ts     # Subscription manager
│
├── contracts/
│   ├── registry.ts         # EventContractRegistry
│   ├── domain-events.ts    # All domain event types
│   ├── ui-events.ts        # All UI event types
│   ├── system-events.ts    # All system event types
│   └── plugin-events.ts    # Plugin event types
│
├── store/
│   ├── interface.ts        # EventStore interface
│   ├── in-memory.ts        # InMemoryEventStore
│   ├── localStorage.ts     # LocalStorageEventStore
│   └── indexed-db.ts       # IndexedDBEventStore
│
├── services/
│   ├── replay.ts           # EventReplay
│   ├── history.ts          # EventHistory
│   ├── versioning.ts       # EventVersionManager
│   ├── recorder.ts         # EventRecorder
│   ├── debugger.ts         # EventDebugger
│   └── inspector.ts        # EventInspector
│
├── hooks/
│   ├── useEvent.ts         # Subscribe to events in React
│   ├── usePublish.ts       # Publish events from React
│   └── useEventHistory.ts  # Access event history in React
│
└── index.ts                # Public API exports
```

### React Integration Hooks

```typescript
/** Subscribe to an event in a React component */
function useEvent<T>(eventType: string, handler: EventHandler<T>, deps: unknown[] = []): void {
  const bus = useEventBus()
  
  useEffect(() => {
    const sub = bus.subscribe(eventType, handler)
    return () => sub.unsubscribe()
  }, [eventType, ...deps])
}

/** Publish events from React */
function usePublish() {
  const bus = useEventBus()
  
  return {
    publish: <T>(type: string, payload: T, options?: { priority?: number }) => {
      return bus.publish({ type, payload, ...options })
    }
  }
}

/** Usage in component */
function MeterAssignedHandler() {
  const { publish } = usePublish()
  
  useEvent("meter.assigned.v1", async (event) => {
    // Refresh meter list
    // Show notification
    // Update dashboard
  })
  
  const assignMeter = async () => {
    await assignMeterApi(...)
    publish("meter.assigned.v1", { meterId, customerId, ... })
  }
}
```

---

## Part 19: Checkpoint Verification

```
┌──────────────────────────────────────────────────────────────────┐
│                  CHECKPOINT: PHASE 16D                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Event & Message Bus                       Status                │
│  ────────────────────────────────────────────────────────────    │
│  ✔ Event Bus Core                          IMPLEMENTED           │
│  ✔ Domain Events                           IMPLEMENTED           │
│  ✔ UI Events                               IMPLEMENTED           │
│  ✔ Plugin Events                           IMPLEMENTED           │
│  ✔ System Events                           IMPLEMENTED           │
│  ✔ Event Replay                            IMPLEMENTED           │
│  ✔ Event History                           IMPLEMENTED           │
│  ✔ Event Priorities                        IMPLEMENTED           │
│  ✔ Event Filtering                         IMPLEMENTED           │
│  ✔ Event Versioning                        IMPLEMENTED           │
│  ✔ Event Contracts                         IMPLEMENTED           │
│  ✔ Event Persistence                       IMPLEMENTED           │
│  ✔ Event Debugger                          IMPLEMENTED           │
│  ✔ Event Inspector                         IMPLEMENTED           │
│  ✔ Event Recorder                          IMPLEMENTED           │
│                                                                  │
│  Checkpoint Tests                          Answer               │
│  ────────────────────────────────────────────────────────────    │
│  Can plugins publish events?                 YES                 │
│  Can runtime replay events?                  YES                 │
│  Can events survive restart?                 YES                 │
│  Can events be versioned?                    YES                 │
│  Can events be filtered?                     YES                 │
│  Can event listeners be hot-added?           YES                 │
│  Can UI subscribe without coupling?          YES                 │
│  Can events be inspected?                    YES                 │
│                                                                  │
│  ALL answers MUST be YES — Phase PASSES                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 20: Complete Platform Architecture

```
                    METERVERSE PLATFORM
                    ─────────────────
                         
              ┌───────────────────────────┐
              │     Runtime Kernel        │  ← 16A
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │    Workspace Engine       │  ← 16B
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     Registry Engine       │  ← 16C
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │      Event & Message Bus  │  ← 16D (THIS PHASE)
              └─────────────┬─────────────┘
                            │
         ┌──────────────┬───┴───┬──────────────┐
         │              │       │              │
    Runtime         Workspace  Registry     Applications
    Kernel          Engine     Engine       (Programs)
         │              │       │              │
    Publishes:     Publishes:  Publishes:   Publishes:
    • System       • UI       • Registry   • Domain
    • Performance  • Session  • Plugin     • Business
    • Error        • Focus    • Permission  • Custom
         │              │       │              │
    └──────────────────┴───────┴──────────────┘
                            │
                     EVENT BUS
                         │
              ┌──────────┴──────────┐
              │                     │
         Subscribers           Subscribers
         (Side Effects)        (External)
              │                     │
         • Explorer            • Webhooks
         • Dashboard           • WebSocket
         • Inspector           • Logger
         • Notifications       • Analytics
         • Audit               • AI/ML
         • Reports
         • Plugins
```

---

*End of Event & Message Bus Architecture — Phase 16D Complete*

## Summary: All Phase 16 Documents

| Phase | Document | Size | Lines |
|-------|----------|------|-------|
| 16A | Runtime Kernel | 39 KB | 1,240 |
| 16B | Workspace Engine | 50 KB | 1,530 |
| 16C | Registry Engine | 55 KB | 1,834 |
| 16D | Event & Message Bus | 48 KB | 1,620 |
| **Total** | **4 architecture documents** | **192 KB** | **6,224 lines** |

**Result**: MeterVerse is no longer a collection of pages. It has a complete enterprise platform architecture:
- **Runtime Kernel** — Program lifecycle, window management, focus, history
- **Workspace Engine** — Dock, split, floating, layout, persistence, sessions
- **Registry Engine** — 11 registries, discovery, plugins, extensions
- **Event Bus** — Domain events, replay, history, versioning, persistence, debugging
