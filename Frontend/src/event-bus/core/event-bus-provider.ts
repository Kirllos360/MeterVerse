import { RuntimeEventBus, type EventBus } from "./event-bus"
import { EventStore } from "../store/event-store"
import { EventReplayService } from "../services/event-replay"
import { EventHistoryService } from "../services/event-history"
import { EventRecorderService } from "../services/event-recorder"
import { EventDebuggerService } from "../services/event-debugger"
import { EventVersionManager } from "../services/event-versioning"

let globalBus: RuntimeEventBus | null = null

export interface EventBusServices {
  bus: RuntimeEventBus
  store: EventStore
  replay: EventReplayService
  history: EventHistoryService
  recorder: EventRecorderService
  debugger: EventDebuggerService
  versioning: EventVersionManager
}

let services: EventBusServices | null = null

export function createEventBus(): EventBusServices {
  if (services) return services

  const store = new EventStore()
  const versioning = new EventVersionManager()
  const bus = new RuntimeEventBus(store, versioning)
  const replay = new EventReplayService(bus, store)
  const history = new EventHistoryService(store)
  const recorder = new EventRecorderService()
  const debuggerService = new EventDebuggerService()

  // Wire debugger into bus
  const origPublish = bus.publish.bind(bus)
  bus.publish = async (type, payload, options) => {
    const result = await origPublish(type, payload, options)
    debuggerService.capture(result.envelope)
    return result
  }

  globalBus = bus
  services = { bus, store, replay, history, recorder, debugger: debuggerService, versioning }
  return services
}

export function getEventBus(): RuntimeEventBus {
  if (!globalBus) throw new Error("EventBus not initialized. Call createEventBus() first.")
  return globalBus
}

export function getEventBusServices(): EventBusServices {
  if (!services) throw new Error("EventBus not initialized. Call createEventBus() first.")
  return services
}
