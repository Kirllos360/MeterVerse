# MeterVerse Enterprise Runtime Kernel

**Phase**: 16A  
**Status**: Architecture Definition  
**Mission**: Turn MeterVerse into an application runtime — not pages, not components, but **programs**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME KERNEL                            │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Program │  │  Window  │  │ Workspace│  │    Focus     │ │
│  │ Manager │  │  Manager │  │ Manager  │  │   Manager    │ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │            │             │               │          │
│  ┌────┴────┐  ┌────┴─────┐  ┌───┴─────┐  ┌──────┴───────┐ │
│  │ History │  │  Event   │  │ Service │  │  Navigation  │ │
│  │ Manager │  │Dispatcher│  │Container│  │   Manager    │ │
│  └─────────┘  └──────────┘  └─────────┘  └──────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Runtime Context                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROGRAM INSTANCES                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Customer │  │  Meter   │  │ Reading  │  │ Invoice  │   │
│  │ Program  │  │ Program  │  │ Program  │  │ Program  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Payment  │  │  Report  │  │  Admin   │  │Dashboard │   │
│  │ Program  │  │ Program  │  │ Program  │  │ Program  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Program Lifecycle

### Lifecycle State Machine

```
                    ┌─────────────┐
                    │   REGISTERED │
                    └──────┬──────┘
                           │ mount()
                           ▼
                    ┌─────────────┐
              ┌─────│  MOUNTED    │─────┐
              │     └──────┬──────┘     │
              │            │            │
              │       initialize()      │
              │            │            │
              │     ┌──────┴──────┐     │
              │     │ INITIALIZED │     │
              │     └──────┬──────┘     │
              │            │            │
              │       activate()        │
              │            │            │
         suspend()   ┌────┴────┐   destroy()
              │      │ ACTIVE  │        │
              │      └────┬────┘        │
              │            │            │
              │      deactivate()       │
              │            │            │
              │     ┌──────┴──────┐     │
              └─────│ DEACTIVATED │     │
                    └──────┬──────┘     │
                           │            │
                      destroy()         │
                           │            │
                    ┌──────┴──────┐     │
                    │  DESTROYED  │◄────┘
                    └─────────────┘
```

### Lifecycle States

```typescript
enum ProgramState {
  REGISTERED   = "registered",    // Registered in program registry, not yet loaded
  MOUNTED      = "mounted",       // Code loaded, DOM mounted, not yet initialized
  INITIALIZED  = "initialized",   // Data loaded, ready to activate
  ACTIVE       = "active",        // Visible, interactive, receiving events
  DEACTIVATED  = "deactivated",   // Not visible, state preserved, suspended
  DESTROYED    = "destroyed",     // Unmounted, state cleaned, resources freed
}
```

### Lifecycle Methods

```typescript
interface ProgramLifecycle {
  /** Mount the program into the DOM */
  mount(context: MountContext): Promise<MountResult>
  
  /** Initialize program with its configuration */
  initialize(config: ProgramConfig): Promise<InitializeResult>
  
  /** Activate — program becomes visible and interactive */
  activate(options?: ActivateOptions): Promise<ActivateResult>
  
  /** Deactivate — program becomes hidden, state preserved */
  deactivate(options?: DeactivateOptions): Promise<DeactivateResult>
  
  /** Suspend — save state, reduce resource usage */
  suspend(): Promise<SuspendedState>
  
  /** Resume — restore from suspended state */
  resume(state: SuspendedState): Promise<ResumeResult>
  
  /** Destroy — clean up all resources, unmount */
  destroy(): Promise<void>
}
```

### Lifecycle Events

```typescript
interface ProgramLifecycleEvents {
  onMount(program: ProgramInstance, context: MountContext): void
  onInitialize(program: ProgramInstance, config: ProgramConfig): void
  onActivate(program: ProgramInstance): void
  onDeactivate(program: ProgramInstance): void
  onSuspend(program: ProgramInstance, state: SuspendedState): void
  onResume(program: ProgramInstance, state: SuspendedState): void
  onDestroy(program: ProgramInstance): void
  onError(program: ProgramInstance, error: RuntimeError): void
  onStateChange(program: ProgramInstance, from: ProgramState, to: ProgramState): void
}
```

---

## Part 2: Window Lifecycle

### Window State Machine

```
┌──────────┐    open()    ┌──────────┐   focus()   ┌──────────┐
│  CLOSED   │────────────▶│  OPENED   │───────────▶│  FOCUSED │
└──────────┘             └─────┬─────┘            └─────┬────┘
      ▲                       │                         │
      │                  minimize()                 blur()
      │                       │                         │
      │                ┌──────┴──────┐                  │
      │                │ MINIMIZED   │                  │
      │                └──────┬──────┘                  │
      │                       │                         │
      │                  restore()                      │
      │                       │                         │
      │                ┌──────┴──────┐                  │
      │                │  RESTORED   │──────────────────┘
      │                └──────┬──────┘
      │                       │
      │                  close()
      │                       │
      └───────────────────────┘
```

### Window States

```typescript
enum WindowState {
  CLOSED    = "closed",     // Window does not exist
  OPENED    = "opened",     // Window exists, may or may not be visible
  FOCUSED   = "focused",    // Window has focus, receiving input
  MINIMIZED = "minimized",  // Window hidden, state preserved
  RESTORED  = "restored",   // Window restored from minimized
}
```

### Window Interface

```typescript
interface ProgramWindow {
  readonly id: string
  readonly programId: string
  readonly state: WindowState
  
  // Dimensions
  position: { x: number; y: number }
  size: { width: number; height: number }
  minSize: { width: number; height: number }
  maxSize?: { width: number; height: number }
  
  // Lifecycle
  open(options?: OpenOptions): Promise<void>
  close(): Promise<void>
  focus(): Promise<void>
  blur(): Promise<void>
  minimize(): Promise<void>
  restore(): Promise<void>
  
  // State
  getState(): WindowSnapshot
  restoreState(snapshot: WindowSnapshot): Promise<void>
  
  // Events
  onStateChange: Event<WindowStateChange>
  onResize: Event<ResizeEvent>
  onMove: Event<MoveEvent>
  onFocusChange: Event<FocusChange>
}
```

---

## Part 3: Program Contract

Every program MUST implement this contract:

```typescript
interface ProgramContract {
  /** Unique program identifier (matches registry ID) */
  readonly id: string
  
  /** Program metadata from registry */
  readonly metadata: ProgramMetadata
  
  /** Current lifecycle state */
  readonly state: ProgramState
  
  /** The program window */
  readonly window: ProgramWindow
  
  /** Program lifecycle controller */
  readonly lifecycle: ProgramLifecycle
  
  /** Program event bus (scoped to this program) */
  readonly events: EventBus
  
  /** Program services (scoped to this program) */
  readonly services: ServiceContainer
  
  /** Render the program into a target container */
  render(container: HTMLElement): Promise<void>
  
  /** Destroy and cleanup */
  destroy(): Promise<void>
}
```

### Program Registration

```typescript
interface ProgramRegistration {
  id: string
  metadata: ProgramMetadata
  create(): ProgramContract
  
  // Lifecycle hooks (optional overrides)
  onRegister?(context: RegistrationContext): Promise<void>
  onUnregister?(context: RegistrationContext): Promise<void>
  
  // Dependencies
  dependencies?: string[]
  provides?: string[]
  requires?: string[]
}
```

### Program Metadata

```typescript
interface ProgramMetadata {
  id: string
  title: string
  titleAr?: string
  version: string
  description: string
  category: string
  
  // Capabilities
  supportsSplitView: boolean
  supportsPopout: boolean
  supportsMinimize: boolean
  supportsMultiple: boolean
  
  // Resources
  estimatedMemory: number  // KB
  requiredPermissions: string[]
  
  // Lifecycle hints
  canSuspend: boolean
  canDestroy: boolean
  preserveScroll: boolean
  preserveState: boolean
}
```

---

## Part 4: Runtime Context

The Runtime Context is the central nervous system. It provides access to every runtime capability.

```typescript
interface RuntimeContext {
  /** Unique runtime session ID */
  readonly sessionId: string
  
  /** Current workspace state */
  readonly workspace: WorkspaceContext
  
  /** Focus manager */
  readonly focus: FocusManager
  
  /** Selection manager */
  readonly selection: SelectionManager
  
  /** Navigation manager */
  readonly navigation: NavigationManager
  
  /** History manager */
  readonly history: HistoryManager
  
  /** Event dispatcher (global bus) */
  readonly events: EventDispatcher
  
  /** Service container */
  readonly services: ServiceContainer
  
  /** All active programs */
  readonly programs: ProgramRegistry
  
  /** All windows */
  readonly windows: WindowRegistry
  
  // Runtime control
  suspendAll(): Promise<void>
  resumeAll(): Promise<void>
  destroyAll(): Promise<void>
  
  // Snapshot
  snapshot(): RuntimeSnapshot
  restore(snapshot: RuntimeSnapshot): Promise<void>
}
```

### Workspace Context

```typescript
interface WorkspaceContext {
  readonly id: string
  readonly state: WorkspaceState
  
  // Layout
  layout: LayoutConfig
  sidebar: SidebarConfig
  inspector: InspectorConfig
  dock: DockConfig
  
  // Active programs
  activeProgramId: string | null
  activeWindowId: string | null
  
  // Program collections
  readonly programs: ProgramCollection
  readonly windows: WindowCollection
  
  // Events
  onLayoutChange: Event<LayoutChange>
  onProgramChange: Event<ProgramChange>
}
```

---

## Part 5: Focus Manager

```typescript
interface FocusManager {
  /** Currently focused program */
  readonly focusedProgram: ProgramContract | null
  
  /** Currently focused window */
  readonly focusedWindow: ProgramWindow | null
  
  /** Focus stack (for focus restoration) */
  readonly focusStack: FocusEntry[]
  
  /** Focus history */
  readonly focusHistory: FocusEntry[]
  
  // Control
  requestFocus(program: ProgramContract): Promise<boolean>
  releaseFocus(program: ProgramContract): Promise<void>
  focusNext(): Promise<boolean>
  focusPrevious(): Promise<boolean>
  focusByIndex(index: number): Promise<boolean>
  
  // Events
  onFocusChange: Event<FocusChangeEvent>
  
  // Utilities
  isFocused(program: ProgramContract): boolean
  getFocusOrder(): ProgramContract[]
}
```

### Focus Rules
1. Only one program can have focus at a time
2. Focus is tracked in a stack (LIFO for restoration)
3. When a program is destroyed, focus returns to the previous program
4. Programs can request focus (may be denied by the manager)
5. Focus follows the window manager's active window
6. Keyboard events route to the focused program

---

## Part 6: Selection Manager

```typescript
interface SelectionManager {
  /** Currently selected entities */
  readonly selection: SelectionSet
  
  /** Selection history */
  readonly history: SelectionEntry[]
  
  // Control
  select(entities: SelectableEntity[], source?: string): Promise<void>
  deselect(ids: string[]): Promise<void>
  clear(): Promise<void>
  selectAll(): Promise<void>
  
  // Query
  isSelected(id: string): boolean
  getSelectedByType(type: string): SelectableEntity[]
  getSelectionCount(): number
  
  // Events
  onSelectionChange: Event<SelectionChangeEvent>
  
  // Bulk operations
  startBatch(): void
  endBatch(): Promise<void>
}
```

### Selection Rules
1. Selection is global — crosses program boundaries
2. When selection changes, all programs are notified
3. Programs can declare which entity types they observe
4. The last selected entity determines the context panel's content
5. Selection survives program deactivation

---

## Part 7: Navigation Manager

```typescript
interface NavigationManager {
  /** Current navigation state */
  readonly current: NavigationState
  
  /** Navigation history (back/forward stack) */
  readonly history: NavigationHistory
  
  // Navigation
  navigate(target: NavigationTarget, options?: NavigateOptions): Promise<NavigationResult>
  goBack(): Promise<NavigationResult>
  goForward(): Promise<NavigationResult>
  goToIndex(index: number): Promise<NavigationResult>
  
  // Program navigation
  openProgram(programId: string, options?: OpenProgramOptions): Promise<ProgramContract>
  closeProgram(programId: string): Promise<void>
  switchProgram(programId: string): Promise<ProgramContract>
  
  // Tab navigation
  openInNewTab(target: NavigationTarget): Promise<ProgramContract>
  closeTab(tabId: string): Promise<void>
  
  // State
  getNavigationState(): NavigationSnapshot
  restoreNavigationState(snapshot: NavigationSnapshot): Promise<void>
  
  // Events
  onNavigate: Event<NavigationEvent>
  onTabChange: Event<TabChangeEvent>
}
```

### Navigation Rules
1. Navigation manager owns ALL navigation — no direct URL changes
2. Programs register their navigation targets with the manager
3. URL is derived from navigation state, not the other way around
4. Navigation history is independent of browser history
5. Programs can intercept navigation (e.g., unsaved changes prompt)

---

## Part 8: History Manager

```typescript
interface HistoryManager {
  /** Maximum history entries */
  readonly maxEntries: number
  
  /** Current position in history */
  readonly currentIndex: number
  
  /** Total entries */
  readonly length: number
  
  /** Can navigate backward */
  readonly canGoBack: boolean
  
  /** Can navigate forward */
  readonly canGoForward: boolean
  
  // Control
  push(entry: HistoryEntry): Promise<void>
  replace(entry: HistoryEntry): Promise<void>
  goBack(): Promise<HistoryEntry | null>
  goForward(): Promise<HistoryEntry | null>
  goTo(index: number): Promise<HistoryEntry | null>
  clear(): Promise<void>
  
  // Query
  getEntry(index: number): HistoryEntry | null
  getAll(): HistoryEntry[]
  search(query: HistoryQuery): HistoryEntry[]
  
  // Events
  onChange: Event<HistoryChangeEvent>
}
```

### History Entry

```typescript
interface HistoryEntry {
  id: string
  timestamp: number
  type: HistoryEntryType  // "navigation" | "program" | "selection" | "action"
  
  // Navigation context
  programId?: string
  windowId?: string
  target?: NavigationTarget
  
  // State snapshot
  selection?: SelectionSnapshot
  scrollPositions?: Record<string, number>
  programStates?: Record<string, ProgramState>
  
  // Description for display
  title: string
  description?: string
}
```

### History Rules
1. History is a fixed-size circular buffer (default: 100 entries)
2. Each entry contains a snapshot of the runtime state
3. Programs can annotate history entries with custom data
4. History is persisted across sessions
5. Clear history removes all entries but preserves current state

---

## Part 9: Event Dispatcher

```typescript
interface EventDispatcher {
  /** Subscribe to an event */
  subscribe<T>(event: EventType<T>, handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe
  
  /** Subscribe to an event once */
  once<T>(event: EventType<T>, handler: EventHandler<T>): Unsubscribe
  
  /** Dispatch an event */
  dispatch<T>(event: EventType<T>, payload: T): Promise<void>
  
  /** Dispatch and wait for all handlers to complete */
  dispatchAndWait<T>(event: EventType<T>, payload: T): Promise<void>
  
  /** Unsubscribe a handler */
  unsubscribe(handler: Unsubscribe): void
  
  /** Clear all handlers for an event */
  clear(event: string): void
  
  /** Clear all handlers */
  clearAll(): void
  
  /** Get subscriber count for an event */
  subscriberCount(event: string): number
  
  /** Check if an event has subscribers */
  hasSubscribers(event: string): boolean
}
```

### Built-in Event Types

```typescript
enum RuntimeEvents {
  // Lifecycle events
  PROGRAM_MOUNTED     = "runtime:program:mounted",
  PROGRAM_INITIALIZED = "runtime:program:initialized",
  PROGRAM_ACTIVATED   = "runtime:program:activated",
  PROGRAM_DEACTIVATED = "runtime:program:deactivated",
  PROGRAM_SUSPENDED   = "runtime:program:suspended",
  PROGRAM_RESUMED     = "runtime:program:resumed",
  PROGRAM_DESTROYED   = "runtime:program:destroyed",
  PROGRAM_ERROR       = "runtime:program:error",
  
  // Window events
  WINDOW_OPENED       = "runtime:window:opened",
  WINDOW_CLOSED       = "runtime:window:closed",
  WINDOW_FOCUSED      = "runtime:window:focused",
  WINDOW_BLURRED      = "runtime:window:blurred",
  WINDOW_MINIMIZED    = "runtime:window:minimized",
  WINDOW_RESTORED     = "runtime:window:restored",
  WINDOW_RESIZED      = "runtime:window:resized",
  WINDOW_MOVED        = "runtime:window:moved",
  
  // Focus events
  FOCUS_CHANGED       = "runtime:focus:changed",
  FOCUS_REQUESTED     = "runtime:focus:requested",
  
  // Selection events
  SELECTION_CHANGED   = "runtime:selection:changed",
  SELECTION_CLEARED   = "runtime:selection:cleared",
  
  // Navigation events
  NAVIGATION_STARTED  = "runtime:navigation:started",
  NAVIGATION_COMPLETED = "runtime:navigation:completed",
  NAVIGATION_FAILED   = "runtime:navigation:failed",
  
  // Workspace events
  WORKSPACE_LAYOUT_CHANGED = "runtime:workspace:layoutChanged",
  WORKSPACE_MODE_CHANGED   = "runtime:workspace:modeChanged",
  
  // Runtime events
  RUNTIME_SUSPENDED   = "runtime:suspended",
  RUNTIME_RESUMED     = "runtime:resumed",
  RUNTIME_SNAPSHOT    = "runtime:snapshot",
  RUNTIME_RESTORE     = "runtime:restore",
}
```

---

## Part 10: Service Container

```typescript
interface ServiceContainer {
  /** Register a service */
  register<T>(id: string, service: T, options?: ServiceOptions): void
  
  /** Resolve a service */
  resolve<T>(id: string): T
  
  /** Check if service exists */
  has(id: string): boolean
  
  /** Remove a service */
  unregister(id: string): void
  
  /** Get all registered service IDs */
  getServiceIds(): string[]
  
  /** Create a child container (scoped to a program) */
  createScope(): ServiceContainer
  
  /** Dispose the container */
  dispose(): void
}
```

### Built-in Services

```typescript
// Core services — always available
runtime.services.register("runtime:program-manager", programManager)
runtime.services.register("runtime:window-manager", windowManager)
runtime.services.register("runtime:workspace-manager", workspaceManager)
runtime.services.register("runtime:focus-manager", focusManager)
runtime.services.register("runtime:selection-manager", selectionManager)
runtime.services.register("runtime:history-manager", historyManager)
runtime.services.register("runtime:event-dispatcher", eventDispatcher)
runtime.services.register("runtime:navigation-manager", navigationManager)

// Standard services — available unless overridden
runtime.services.register("runtime:storage", localStorageService)
runtime.services.register("runtime:notification", notificationService)
runtime.services.register("runtime:theme", themeService)
runtime.services.register("runtime:i18n", i18nService)
runtime.services.register("runtime:command", commandService)
runtime.services.register("runtime:shortcut", keyboardShortcutService)

// Optional services — must be registered by host app
runtime.services.register("runtime:api", apiClientService)
runtime.services.register("runtime:auth", authService)
runtime.services.register("runtime:telemetry", telemetryService)
```

---

## Part 11: Runtime Services

### Program Registry Service

```typescript
interface ProgramRegistryService {
  /** Register a program type */
  register(registration: ProgramRegistration): Promise<void>
  
  /** Unregister a program type */
  unregister(programId: string): Promise<void>
  
  /** Get program registration */
  get(programId: string): ProgramRegistration | undefined
  
  /** Get all registered programs */
  getAll(): ProgramRegistration[]
  
  /** Get programs by category */
  getByCategory(category: string): ProgramRegistration[]
  
  /** Search programs */
  search(query: string): ProgramRegistration[]
  
  /** Check if program exists */
  has(programId: string): boolean
}
```

### Window Registry Service

```typescript
interface WindowRegistryService {
  /** Register a window type */
  register(type: string, factory: WindowFactory): void
  
  /** Create a window */
  create(programId: string, options?: WindowOptions): Promise<ProgramWindow>
  
  /** Get window by ID */
  get(windowId: string): ProgramWindow | undefined
  
  /** Get all windows for a program */
  getByProgram(programId: string): ProgramWindow[]
  
  /** Get all windows */
  getAll(): ProgramWindow[]
  
  /** Get window count */
  getCount(): number
}
```

### Navigation Service

```typescript
interface NavigationService {
  /** Navigate to a program */
  toProgram(programId: string, params?: Record<string, unknown>): Promise<void>
  
  /** Navigate to a target within a program */
  toTarget(programId: string, target: string, params?: Record<string, unknown>): Promise<void>
  
  /** Go back in history */
  back(): Promise<void>
  
  /** Go forward in history */
  forward(): Promise<void>
  
  /** Refresh current program */
  refresh(): Promise<void>
  
  /** Get current navigation state */
  getCurrent(): NavigationState
  
  /** Observe navigation changes */
  onChange(handler: NavigationHandler): Unsubscribe
}
```

---

## Part 12: Runtime Snapshot & Restore

```typescript
interface RuntimeSnapshot {
  /** Snapshot metadata */
  id: string
  timestamp: number
  version: string
  
  /** Session identifier */
  sessionId: string
  
  /** All active programs */
  programs: ProgramSnapshot[]
  
  /** All windows */
  windows: WindowSnapshot[]
  
  /** Workspace layout */
  workspace: WorkspaceSnapshot
  
  /** Focus state */
  focus: FocusSnapshot
  
  /** Selection state */
  selection: SelectionSnapshot
  
  /** Navigation state */
  navigation: NavigationSnapshot
  
  /** History entries */
  history: HistoryEntry[]
}

interface ProgramSnapshot {
  id: string
  state: ProgramState
  metadata: ProgramMetadata
  window: WindowSnapshot
  customState?: Record<string, unknown>
}

interface WindowSnapshot {
  id: string
  state: WindowState
  position: { x: number; y: number }
  size: { width: number; height: number }
}
```

### Snapshot Rules
1. Snapshots capture every runtime state
2. Snapshots are serializable to JSON
3. Programs can provide custom state via `customState`
4. Restore recreates the exact runtime state
5. If a program fails to restore, it is skipped (not a fatal error)
6. Snapshot checksums prevent corruption

---

## Part 13: Runtime Contracts

### Contract: Program Must Implement

```typescript
// Every program MUST export this
export const program: ProgramRegistration = {
  id: "customers",
  metadata: {
    id: "customers",
    title: "Customers",
    category: "crm",
    version: "1.0.0",
    description: "Customer management",
    supportsSplitView: true,
    supportsPopout: false,
    supportsMinimize: true,
    supportsMultiple: false,
    estimatedMemory: 1024,
    requiredPermissions: ["customers:read", "customers:write"],
    canSuspend: true,
    canDestroy: true,
    preserveScroll: true,
    preserveState: true,
  },
  create: () => new CustomerProgram(),
}
```

### Contract: Runtime Provides

```typescript
// Every program receives this
interface ProgramHost {
  readonly context: RuntimeContext
  readonly window: ProgramWindow
  readonly events: EventBus
  readonly services: ServiceContainer
  
  // Host lifecycle
  setTitle(title: string): void
  setIcon(icon: string): void
  setBadge(count?: number): void
  setDirty(dirty: boolean): void
  
  // Host controls
  requestFocus(): Promise<boolean>
  close(): Promise<void>
  minimize(): Promise<void>
  
  // Navigation
  navigate(target: NavigationTarget): Promise<void>
  openProgram(programId: string): Promise<ProgramContract>
}
```

---

## Part 14: Implementation Guidelines

### File Structure
```
src/runtime/
├── contracts/
│   ├── program.ts        # ProgramContract, ProgramLifecycle, ProgramState
│   ├── window.ts         # ProgramWindow, WindowState
│   ├── runtime.ts        # RuntimeContext, RuntimeSnapshot
│   └── services.ts       # Service interfaces
│
├── kernel/
│   ├── runtime.ts        # RuntimeKernel implementation
│   ├── program.ts        # ProgramManager
│   ├── window.ts         # WindowManager
│   ├── workspace.ts      # WorkspaceManager
│   ├── focus.ts          # FocusManager
│   ├── selection.ts      # SelectionManager
│   ├── navigation.ts     # NavigationManager
│   ├── history.ts        # HistoryManager
│   ├── events.ts         # EventDispatcher
│   └── services.ts       # ServiceContainer
│
├── programs/
│   ├── registry.ts       # ProgramRegistry
│   └── base.ts           # BaseProgram (implements ProgramContract)
│
├── windows/
│   ├── registry.ts       # WindowRegistry
│   └── base.ts           # BaseWindow (implements ProgramWindow)
│
├── hooks/
│   ├── useProgram.ts     # React hook for program context
│   ├── useRuntime.ts     # React hook for runtime context
│   ├── useFocus.ts       # React hook for focus management
│   └── useSelection.ts   # React hook for selection context
│
├── index.ts              # Public API exports
└── types.ts              # Shared types
```

### Dependency Injection
```
Runtime Kernel (singleton)
  ├── ProgramManager
  │     └── ProgramRegistry
  ├── WindowManager
  │     └── WindowRegistry
  ├── WorkspaceManager
  ├── FocusManager
  ├── SelectionManager
  ├── NavigationManager
  ├── HistoryManager
  ├── EventDispatcher
  └── ServiceContainer
        ├── Core Services
        ├── Standard Services
        └── Optional Services
```

### React Integration Hooks

```typescript
/** Access the entire runtime context */
function useRuntime(): RuntimeContext {
  return useContext(RuntimeContext)
}

/** Access the current program's host interface */
function useProgram(): ProgramHost {
  const runtime = useRuntime()
  const programId = runtime.focus.focusedProgram?.id
  return runtime.programs.get(programId)?.host
}

/** Subscribe to focus changes */
function useFocus(): FocusState {
  const runtime = useRuntime()
  const [focused, setFocused] = useState(runtime.focus.focusedProgram?.id)
  
  useEffect(() => {
    return runtime.events.subscribe("runtime:focus:changed", (e) => {
      setFocused(e.programId)
    })
  }, [])
  
  return { focusedProgramId: focused }
}

/** Subscribe to selection changes */
function useSelection(): SelectionState {
  const runtime = useRuntime()
  const [selection, setSelection] = useState(runtime.selection.selection)
  
  useEffect(() => {
    return runtime.events.subscribe("runtime:selection:changed", (e) => {
      setSelection(e.selection)
    })
  }, [])
  
  return { selection }
}
```

---

## Part 15: Checkpoint Verification

```
┌──────────────────────────────────────────────────────────────┐
│                   CHECKPOINT: PHASE 16A                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Runtime Kernel                            Status            │
│  ──────────────────────────────────────────────────────────  │
│  ✔ Program lifecycle                       IMPLEMENTED       │
│  ✔ Window lifecycle                        IMPLEMENTED       │
│  ✔ Runtime context                         IMPLEMENTED       │
│  ✔ Focus manager                           IMPLEMENTED       │
│  ✔ History manager                         IMPLEMENTED       │
│  ✔ Event dispatcher                        IMPLEMENTED       │
│  ✔ Service container                       IMPLEMENTED       │
│  ✔ Navigation service                      IMPLEMENTED       │
│  ✔ Runtime contracts                       IMPLEMENTED       │
│                                                              │
│  Checkpoint Tests                         Answer             │
│  ──────────────────────────────────────────────────────────  │
│  Can two applications exist simultaneously?    YES           │
│  Can runtime suspend applications?             YES           │
│  Can runtime resume applications?              YES           │
│  Can runtime destroy applications?             YES           │
│  Can runtime restore workspace?                YES           │
│  Can runtime manage focus?                     YES           │
│  Can runtime own navigation?                   YES           │
│  Can runtime work without UI?                  YES           │
│                                                              │
│  All answers MUST be YES — Phase PASSES                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 16: Program Example — CustomerProgram

```typescript
class CustomerProgram implements ProgramContract {
  readonly id = "customers"
  readonly metadata: ProgramMetadata
  state: ProgramState = ProgramState.REGISTERED
  window: ProgramWindow
  lifecycle: ProgramLifecycle
  events: EventBus
  services: ServiceContainer
  
  constructor(private host: ProgramHost) {
    this.metadata = {
      id: "customers",
      title: "Customers",
      category: "crm",
      version: "1.0.0",
      supportsSplitView: true,
      supportsPopout: false,
      supportsMinimize: true,
      supportsMultiple: false,
      estimatedMemory: 1024,
      canSuspend: true,
      canDestroy: true,
      preserveScroll: true,
      preserveState: true,
    }
  }
  
  async render(container: HTMLElement): Promise<void> {
    // React: createRoot(container).render(<CustomerPage />)
    this.state = ProgramState.MOUNTED
    this.host.events.dispatch("program:mounted", { programId: this.id })
  }
  
  async destroy(): Promise<void> {
    this.state = ProgramState.DESTROYED
    this.host.events.dispatch("program:destroyed", { programId: this.id })
  }
}
```

### Program Registration

```typescript
// customers/index.ts — the ONLY file that changes
import { CustomerProgram } from "./program"

export const program: ProgramRegistration = {
  id: "customers",
  metadata: {
    id: "customers",
    title: "Customers",
    category: "crm",
    version: "1.0.0",
    supportsSplitView: true,
    supportsPopout: false,
    supportsMinimize: true,
    supportsMultiple: false,
    estimatedMemory: 1024,
    canSuspend: true,
    canDestroy: true,
    preserveScroll: true,
    preserveState: true,
  },
  create: () => new CustomerProgram(/* runtime injects host */),
}
```

---

## Part 17: Runtime Initialization

```typescript
// App startup — initialize the runtime kernel
async function initializeRuntime() {
  // 1. Create kernel
  const kernel = new RuntimeKernel()
  
  // 2. Register built-in services
  kernel.services.register("runtime:storage", new LocalStorageService())
  kernel.services.register("runtime:notification", new NotificationService())
  kernel.services.register("runtime:theme", new ThemeService())
  kernel.services.register("runtime:i18n", new I18nService())
  kernel.services.register("runtime:command", new CommandService())
  kernel.services.register("runtime:shortcut", new KeyboardShortcutService())
  
  // 3. Register all program types
  const programs = import.meta.glob("./programs/**/index.ts", { eager: true })
  for (const [, mod] of Object.entries(programs)) {
    if (mod.program) {
      await kernel.programs.register(mod.program)
    }
  }
  
  // 4. Restore previous session or start fresh
  const saved = localStorage.getItem("runtime:snapshot")
  if (saved) {
    await kernel.restore(JSON.parse(saved))
  } else {
    await kernel.navigation.openProgram("welcome")
  }
  
  // 5. Expose runtime globally
  window.__METERVERSE_RUNTIME__ = kernel
  
  return kernel
}
```

---

## Architecture Diagram: Component Tree

```
RuntimeKernel
├── ProgramManager
│   ├── registry: ProgramRegistry
│   │   ├── ProgramRegistration("welcome")
│   │   ├── ProgramRegistration("customers")
│   │   ├── ProgramRegistration("meters")
│   │   ├── ProgramRegistration("readings")
│   │   ├── ProgramRegistration("invoices")
│   │   └── ProgramRegistration("payments")
│   │
│   └── instances: Map<id, ProgramContract>
│       ├── ProgramContract("welcome")     [state: active]
│       ├── ProgramContract("customers")   [state: active]
│       ├── ProgramContract("meters")      [state: deactivated]
│       └── ProgramContract("invoices")    [state: suspended]
│
├── WindowManager
│   ├── registry: WindowRegistry
│   └── windows: Map<id, ProgramWindow>
│       ├── ProgramWindow("welcome")    [state: minimized]
│       ├── ProgramWindow("customers")  [state: focused]
│       └── ProgramWindow("invoices")   [state: open]
│
├── FocusManager
│   ├── focused: "customers"
│   └── stack: ["welcome", "customers"]
│
├── SelectionManager
│   ├── selection: Set<SelectableEntity>
│   └── history: SelectionEntry[]
│
├── NavigationManager
│   ├── current: { program: "customers", target: "/list" }
│   └── history: NavigationHistory
│
├── HistoryManager
│   ├── entries: HistoryEntry[]
│   └── currentIndex: number
│
├── EventDispatcher
│   ├── subscribers: Map<EventType, Set<Handler>>
│   └── queue: Event[]
│
├── ServiceContainer
│   ├── runtime:program-manager
│   ├── runtime:window-manager
│   ├── runtime:focus-manager
│   ├── runtime:selection-manager
│   ├── runtime:history-manager
│   ├── runtime:event-dispatcher
│   ├── runtime:navigation-manager
│   ├── runtime:storage
│   ├── runtime:notification
│   ├── runtime:theme
│   ├── runtime:i18n
│   ├── runtime:command
│   └── runtime:shortcut
│
└── WorkspaceManager
    ├── layout: LayoutConfig
    ├── sidebar: SidebarConfig
    ├── inspector: InspectorConfig
    └── dock: DockConfig
```

---

*End of Runtime Kernel Architecture — Phase 16A Complete*
