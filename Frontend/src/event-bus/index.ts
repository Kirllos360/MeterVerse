// Event & Message Bus — Phase 17D Implementation
// Everything communicates through events. No component talks directly to another.

export { RuntimeEventBus, EventPriority } from "./core/event-bus"
export { EventFilterEngine } from "./core/event-filter"
export { createEventBus, getEventBus, getEventBusServices } from "./core/event-bus-provider"
export type { EventBus, EventEnvelope, EventSource, SubscribeOptions, PublishedEvent, EventHandler, Unsubscribe } from "./core/event-bus"
export type { EventFilter } from "./core/event-filter"

export { EventStore } from "./store/event-store"
export type { EventQuery, EventStoreStats } from "./store/event-store"

export { EventReplayService } from "./services/event-replay"
export type { ReplayProgress, ReplayResult } from "./services/event-replay"

export { EventVersionManager } from "./services/event-versioning"
export type { EventVersion, EventMigrator } from "./services/event-versioning"

export { EventHistoryService } from "./services/event-history"
export type { HistoryEntry, HistoryStats } from "./services/event-history"

export { EventRecorderService } from "./services/event-recorder"
export type { Recording } from "./services/event-recorder"

export { EventDebuggerService } from "./services/event-debugger"
export type { CapturedEvent } from "./services/event-debugger"

export { useEvent, usePublish, useEventHistory, useEventStats } from "./hooks/useEvent"
