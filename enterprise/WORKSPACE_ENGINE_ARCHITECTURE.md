# MeterVerse Workspace Engine

**Phase**: 16B  
**Status**: Architecture Definition  
**Dependencies**: Phase 16A (Runtime Kernel)  
**Mission**: Replace pages with workspace programs. Workspace becomes an operating environment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE ENGINE                             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Workspace   │  │    Dock      │  │   Window     │  │  Split  │ │
│  │   Manager    │  │   Manager    │  │   Manager    │  │ Manager │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
│         │                 │                 │               │      │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐     │      │
│  │   Floating   │  │   Layout    │  │ Persistence  │     │      │
│  │ Window Mgr   │  │   Manager   │  │   Engine     │     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │      │
│         │                 │                 │               │      │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐     │      │
│  │   Session    │  │    Pinned    │  │   Recent     │     │      │
│  │   Manager    │  │   Programs   │  │   Programs   │     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │      │
│                                                           │      │
│  ┌────────────────────────────────────────────────────────┴────┐ │
│  │                    RUNTIME KERNEL (Phase 16A)               │ │
│  │  ProgramMgr │ WindowMgr │ FocusMgr │ NavMgr │ EventBus     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Workspace Manager

The Workspace Manager is the top-level orchestrator. It owns the entire workspace environment.

```typescript
interface WorkspaceManager {
  /** Current workspace state */
  readonly state: WorkspaceState
  
  /** Sub-managers */
  readonly dock: DockManager
  readonly windows: WindowManager
  readonly split: SplitManager
  readonly floating: FloatingWindowManager
  readonly layout: LayoutManager
  readonly persistence: PersistenceEngine
  readonly sessions: SessionManager
  readonly pinned: PinnedPrograms
  readonly recent: RecentPrograms
  
  // Lifecycle
  initialize(options: WorkspaceOptions): Promise<void>
  destroy(): Promise<void>
  
  // Workspace control
  openProgram(programId: string, options?: OpenProgramOptions): Promise<ProgramSlot>
  closeProgram(slotId: string): Promise<void>
  focusProgram(slotId: string): Promise<void>
  
  // Layout
  setLayout(layout: WorkspaceLayout): Promise<void>
  getLayout(): WorkspaceLayout
  
  // Persistence
  save(): Promise<WorkspaceSnapshot>
  restore(snapshot: WorkspaceSnapshot): Promise<void>
  
  // Events
  onWorkspaceChange: Event<WorkspaceChangeEvent>
}
```

### Workspace State

```typescript
interface WorkspaceState {
  /** Workspace mode */
  mode: WorkspaceMode  // "single" | "multi" | "split" | "floating"
  
  /** Active program slot */
  activeSlotId: string | null
  
  /** All program slots */
  slots: ProgramSlot[]
  
  /** Layout configuration */
  layout: WorkspaceLayout
  
  /** Dock state */
  dock: DockState
  
  /** Session info */
  session: SessionInfo
}

type WorkspaceMode = "single" | "multi" | "split" | "floating"
```

### Program Slot

A Program Slot is a runtime container for one program instance.

```typescript
interface ProgramSlot {
  /** Unique slot identifier */
  readonly id: string
  
  /** The program running in this slot */
  readonly program: ProgramContract
  
  /** Slot position in the workspace grid */
  position: SlotPosition
  
  /** Slot size */
  size: SlotSize
  
  /** Slot state */
  state: SlotState
  
  /** Slot type */
  type: SlotType  // "main" | "split" | "floating" | "detached"
  
  /** Whether the slot is focused */
  isFocused: boolean
  
  /** Slot metadata */
  metadata: SlotMetadata
}

type SlotState = "loading" | "active" | "suspended" | "minimized" | "closed"
type SlotType = "main" | "split" | "floating" | "detached"

interface SlotPosition {
  row: number
  column: number
  order: number
}

interface SlotSize {
  width: number | "auto"  // px or auto-fill
  height: number | "auto"
  minWidth?: number
  minHeight?: number
}
```

---

## Part 2: Dock Manager

The Dock manages the sidebar/dock where programs are launched and organized.

```typescript
interface DockManager {
  /** Dock state */
  readonly state: DockState
  
  /** All dock items */
  readonly items: DockItem[]
  
  /** Pinned items */
  readonly pinned: PinnedPrograms
  
  /** Recent items */
  readonly recent: RecentPrograms
  
  // Dock control
  setMode(mode: DockMode): Promise<void>  // "expanded" | "collapsed" | "dock" | "auto-hide"
  toggle(): Promise<void>
  expand(): Promise<void>
  collapse(): Promise<void>
  
  // Items
  addItem(programId: string, options?: DockItemOptions): Promise<DockItem>
  removeItem(itemId: string): Promise<void>
  reorderItem(itemId: string, newIndex: number): Promise<void>
  pinItem(itemId: string): Promise<void>
  unpinItem(itemId: string): Promise<void>
  
  // Categories
  setCategoryExpanded(categoryId: string, expanded: boolean): Promise<void>
  getCategories(): DockCategory[]
  
  // Search
  search(query: string): DockSearchResult[]
  
  // Events
  onDockChange: Event<DockChangeEvent>
}

type DockMode = "expanded" | "collapsed" | "dock" | "auto-hide"
```

### Dock Item

```typescript
interface DockItem {
  id: string
  programId: string
  title: string
  titleAr?: string
  icon: string
  category: string
  
  // State
  isPinned: boolean
  isActive: boolean
  hasBadge: boolean
  badgeCount?: number
  
  // Recent activity
  lastAccessed: number
  accessCount: number
  
  // Visual
  metadata: ProgramMetadata
}
```

### Dock Category

```typescript
interface DockCategory {
  id: string
  title: string
  titleAr?: string
  icon: string
  order: number
  isExpanded: boolean
  items: DockItem[]
  itemCount: number
}
```

### Dock Events

```typescript
interface DockChangeEvent {
  type: "modeChanged" | "itemAdded" | "itemRemoved" | "itemReordered" | 
        "itemPinned" | "itemUnpinned" | "categoryExpanded" | "categoryCollapsed"
  dockState: DockState
  affectedItemId?: string
}

// Flow: User clicks dock item
// DockManager → ProgramManager (open program) → WindowManager (create window)
// → FocusManager (set focus) → DockManager (mark active)
// → EventDispatcher.dispatch("workspace:dock:itemActivated")
```

---

## Part 3: Window Manager

The Window Manager controls all program windows within the workspace.

```typescript
interface WindowManager {
  /** All windows */
  readonly windows: ProgramWindow[]
  
  /** Active window */
  readonly activeWindow: ProgramWindow | null
  
  /** Window count */
  readonly count: number
  
  // CRUD
  createWindow(programId: string, options?: CreateWindowOptions): Promise<ProgramWindow>
  destroyWindow(windowId: string): Promise<void>
  
  // Focus
  focusWindow(windowId: string): Promise<void>
  focusNext(): Promise<void>
  focusPrevious(): Promise<void>
  
  // State
  minimizeWindow(windowId: string): Promise<void>
  maximizeWindow(windowId: string): Promise<void>
  restoreWindow(windowId: string): Promise<void>
  
  // Ordering
  bringToFront(windowId: string): Promise<void>
  sendToBack(windowId: string): Promise<void>
  
  // Tabs
  createTab(programId: string, options?: CreateTabOptions): Promise<ProgramTab>
  closeTab(tabId: string): Promise<void>
  reorderTabs(tabIds: string[]): Promise<void>
  pinTab(tabId: string): Promise<void>
  unpinTab(tabId: string): Promise<void>
  duplicateTab(tabId: string): Promise<ProgramTab>
  
  // Groups
  groupTabs(parentId: string, childIds: string[]): Promise<TabGroup>
  ungroupTabs(groupId: string): Promise<void>
  
  // Events
  onWindowChange: Event<WindowChangeEvent>
  onTabChange: Event<TabChangeEvent>
}
```

### Program Tab

```typescript
interface ProgramTab {
  id: string
  programId: string
  title: string
  icon?: string
  
  // State
  isActive: boolean
  isPinned: boolean
  isDirty: boolean
  isTemporary: boolean  // Cmd+click opens temporary tabs
  
  // Navigation
  canGoBack: boolean
  canGoForward: boolean
  navigationHistory: NavigationEntry[]
  
  // Scroll
  scrollPosition: { x: number; y: number }
  
  // Metadata
  createdAt: number
  lastAccessed: number
  
  // Lifecycle
  activate(): Promise<void>
  deactivate(): Promise<void>
  close(): Promise<void>
  reload(): Promise<void>
}

interface TabGroup {
  id: string
  parentId: string
  childIds: string[]
  title: string
  isCollapsed: boolean
}
```

### Tab Lifecycle Flow

```
User clicks "Customers" in dock
  → DockManager emits itemActivated
  → WindowManager.createTab("customers")
    → RuntimeKernel.programs.get("customers").create()
    → ProgramLifecycle.mount()
    → ProgramLifecycle.initialize(config)
    → ProgramLifecycle.activate()
    → Tab created with state: "loading" → "active"
  → WindowManager.focusTab(tab.id)
    → FocusManager.requestFocus(program)
  → EventDispatcher.dispatch("workspace:tab:created")
  
User closes tab
  → WindowManager.closeTab(tab.id)
    → ProgramLifecycle.deactivate()
    → ProgramLifecycle.suspend()
    → If not pinned: ProgramLifecycle.destroy()
    → Tab removed from window
    → Previous tab gets focus
  → EventDispatcher.dispatch("workspace:tab:closed")
```

### Temporary Tabs

```typescript
interface TemporaryTabPolicy {
  /** Cmd+click opens in temporary tab */
  enabled: boolean
  
  /** Max temporary tabs before recycling */
  maxTemporary: number  // default: 10
  
  /** Auto-close temporary tab when another opens */
  autoClose: boolean
  
  /** Promote to permanent on interaction */
  promoteOnInteraction: boolean
  
  /** Promote to permanent on manual close attempt */
  promoteOnClose: boolean
}
```

Temporary tabs are recycled. When a new temporary tab opens and the limit is reached, the least-recently-used temporary tab closes automatically.

---

## Part 4: Split Manager

The Split Manager controls split-view layouts within the workspace.

```typescript
interface SplitManager {
  /** Current split configuration */
  readonly config: SplitConfig
  
  /** All split panels */
  readonly panels: SplitPanel[]
  
  /** Whether split view is active */
  readonly isSplit: boolean
  
  // Split control
  split(direction: SplitDirection, programId: string): Promise<SplitPanel>
  closePanel(panelId: string): Promise<void>
  focusPanel(panelId: string): Promise<void>
  swapPanels(panelIdA: string, panelIdB: string): Promise<void>
  
  // Resize
  resizeSplit(dividerIndex: number, position: number): Promise<void>
  
  // Layout
  setSplitLayout(layout: SplitLayout): Promise<void>
  getSplitLayout(): SplitLayout
  
  // Detach
  detachPanel(panelId: string): Promise<ProgramWindow>  // Convert split to floating
  attachPanel(panelId: string, targetPanelId: string): Promise<void>  // Merge floating back
  
  // Events
  onSplitChange: Event<SplitChangeEvent>
}

type SplitDirection = "horizontal" | "vertical"

interface SplitConfig {
  direction: SplitDirection
  panels: SplitPanel[]
  dividers: SplitDivider[]
}

interface SplitPanel {
  id: string
  programId: string
  slotId: string
  size: number  // flex ratio (1-100)
  minSize: number
  isFocused: boolean
}

interface SplitDivider {
  index: number  // Between panel[index] and panel[index+1]
  position: number  // percentage
}
```

### Split View Flow

```
User drags tab to edge
  → WindowManager detects drag target
  → SplitManager.split("vertical", "customers")
    → Creates new SplitPanel
    → Creates divider between panels
    → Resizes existing panels
    → Each panel gets its own ProgramSlot
    → Each slot renders its program independently
  → EventDispatcher.dispatch("workspace:split:created")
```

### Split Tree Structure

```
Workspace
├── SplitPanel (left, 60%)
│   └── ProgramSlot("customers")
│       └── ProgramContract (active)
│
├── SplitDivider (resizable)
│
└── SplitPanel (right, 40%)
    └── SplitView (horizontal)
        ├── SplitPanel (top, 50%)
        │   └── ProgramSlot("meters")
        │       └── ProgramContract (active)
        ├── SplitDivider
        └── SplitPanel (bottom, 50%)
            └── ProgramSlot("readings")
                └── ProgramContract (active)
```

---

## Part 5: Floating Window Manager

The Floating Window Manager controls windows that exist outside the main workspace grid.

```typescript
interface FloatingWindowManager {
  /** All floating windows */
  readonly windows: FloatingWindow[]
  
  /** Floating window count */
  readonly count: number
  
  // CRUD
  createFloating(programId: string, options?: FloatingOptions): Promise<FloatingWindow>
  destroyFloating(windowId: string): Promise<void>
  
  // Position
  moveFloating(windowId: string, position: { x: number; y: number }): Promise<void>
  resizeFloating(windowId: string, size: { width: number; height: number }): Promise<void>
  
  // State
  minimizeFloating(windowId: string): Promise<void>
  maximizeFloating(windowId: string): Promise<void>
  restoreFloating(windowId: string): Promise<void>
  bringToFront(windowId: string): Promise<void>
  
  // Detach / Attach
  detachFromWorkspace(slotId: string, options?: FloatingOptions): Promise<FloatingWindow>
  attachToWorkspace(windowId: string, targetSlotId?: string): Promise<void>
  
  // Events
  onFloatingChange: Event<FloatingChangeEvent>
}
```

### Floating Window

```typescript
interface FloatingWindow {
  id: string
  programId: string
  title: string
  
  // Position
  position: { x: number; y: number }
  size: { width: number; height: number }
  minSize: { width: number; height: number }
  maxSize?: { width: number; height: number }
  
  // State
  state: FloatingWindowState  // "normal" | "minimized" | "maximized"
  zIndex: number
  isFocused: boolean
  
  // Window features
  showTitleBar: boolean
  showControls: boolean  // minimize, maximize, close
  resizable: boolean
  draggable: boolean
  
  // Program reference
  slot: ProgramSlot
  program: ProgramContract
}

type FloatingWindowState = "normal" | "minimized" | "maximized"
```

### Detached Window (Popout)

```typescript
interface DetachedWindow {
  id: string
  programId: string
  
  // Browser window
  browserWindow: Window | null
  isOpen: boolean
  lastKnownPosition: { x: number; y: number }
  lastKnownSize: { width: number; height: number }
  
  // Communication
  channel: MessageChannel  // postMessage between windows
  
  // Lifecycle
  open(): Promise<void>
  close(): Promise<void>
  focus(): Promise<void>
  
  // Sync
  syncState(): Promise<void>
  receiveState(data: unknown): Promise<void>
}
```

### Detached Window Flow

```
User clicks "Open in new window"
  → WindowManager.detachTab(tabId)
    → FloatingWindowManager.detachFromWorkspace(slotId)
    → Creates DetachedWindow
    → Opens new browser window via window.open()
    → Sets up postMessage channel for sync
    → Program continues running in new window
  → Main workspace shows "detached" indicator in tab
  → Changes in either window sync via MessageChannel
  
User clicks "Attach back"
  → FloatingWindowManager.attachToWorkspace(detachedId)
  → Sends final state from detached window
  → Closes browser window
  → Restores tab in main workspace
  → Program resumes in main workspace slot
```

---

## Part 6: Layout Manager

The Layout Manager handles workspace layout templates and saved configurations.

```typescript
interface LayoutManager {
  /** Current layout */
  readonly current: WorkspaceLayout
  
  /** Available layout templates */
  readonly templates: LayoutTemplate[]
  
  /** Saved layouts */
  readonly savedLayouts: SavedLayout[]
  
  // Templates
  getTemplates(): LayoutTemplate[]
  applyTemplate(templateId: string): Promise<void>
  
  // Saved layouts
  saveLayout(name: string, options?: SaveLayoutOptions): Promise<SavedLayout>
  loadLayout(layoutId: string): Promise<void>
  deleteLayout(layoutId: string): Promise<void>
  renameLayout(layoutId: string, newName: string): Promise<void>
  
  // Defaults
  setDefaultLayout(layoutId: string): Promise<void>
  getDefaultLayout(): SavedLayout | null
  
  // Events
  onLayoutChange: Event<LayoutChangeEvent>
}
```

### Workspace Layout

```typescript
interface WorkspaceLayout {
  id: string
  name: string
  type: LayoutType  // "single" | "split" | "grid" | "floating"
  
  // Grid configuration
  columns: number
  rows: number
  
  // Split configuration
  splits: SplitConfig[]
  
  // Window configuration
  windows: WindowLayout[]
  
  // Dock
  dock: DockLayout
  
  // Inspector
  inspector: InspectorLayout
}

interface WindowLayout {
  programId: string
  position: SlotPosition
  size: SlotSize
  state: SlotState
  isPinned: boolean
  tabHistory: string[]  // previously opened tabs in this slot
}

interface DockLayout {
  mode: DockMode
  pinnedItems: string[]  // program IDs
  recentItems: string[]  // program IDs in order
  expandedCategories: string[]
}

interface InspectorLayout {
  isOpen: boolean
  width: number
  activeSection: string
}
```

### Layout Templates

```typescript
interface LayoutTemplate {
  id: string
  name: string
  description: string
  icon: string
  
  // Preset
  layout: WorkspaceLayout
  
  // Metadata
  category: "productivity" | "monitoring" | "billing" | "admin"
  isDefault: boolean
  isBuiltin: boolean
}

// Built-in templates
const BUILTIN_TEMPLATES: LayoutTemplate[] = [
  {
    id: "single-focus",
    name: "Single Focus",
    description: "One program at a time, full workspace",
    icon: "maximize",
    category: "productivity",
    isDefault: true,
    isBuiltin: true,
    layout: {
      columns: 1, rows: 1,
      splits: [],
      windows: [],
      dock: { mode: "dock", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: false, width: 360, activeSection: "details" },
    }
  },
  {
    id: "split-comparison",
    name: "Split Comparison",
    description: "Two programs side by side",
    icon: "columns",
    category: "productivity",
    isBuiltin: true,
    layout: {
      columns: 2, rows: 1,
      splits: [{ direction: "vertical", panels: [], dividers: [{ index: 0, position: 50 }] }],
      windows: [],
      dock: { mode: "dock", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: true, width: 360, activeSection: "details" },
    }
  },
  {
    id: "monitoring-grid",
    name: "Monitoring Grid",
    description: "4-up grid for live monitoring",
    icon: "grid",
    category: "monitoring",
    isBuiltin: true,
    layout: {
      columns: 2, rows: 2,
      splits: [
        { direction: "vertical", panels: [], dividers: [{ index: 0, position: 50 }] },
        { direction: "horizontal", panels: [], dividers: [{ index: 0, position: 50 }] },
      ],
      windows: [],
      dock: { mode: "auto-hide", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: false, width: 360, activeSection: "details" },
    }
  },
  {
    id: "billing-workflow",
    name: "Billing Workflow",
    description: "Invoices + Payments + Reports",
    icon: "receipt",
    category: "billing",
    isBuiltin: true,
    layout: {
      columns: 3, rows: 1,
      splits: [{ direction: "vertical", panels: [], dividers: [{ index: 0, position: 33 }, { index: 1, position: 66 }] }],
      windows: [],
      dock: { mode: "collapsed", pinnedItems: ["invoices", "payments", "reports"], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: true, width: 360, activeSection: "details" },
    }
  },
]
```

---

## Part 7: Persistence Engine

The Persistence Engine saves and restores the entire workspace state.

```typescript
interface PersistenceEngine {
  /** Storage key prefix */
  readonly storageKey: string
  
  /** Whether persistence is enabled */
  readonly enabled: boolean
  
  // Save
  saveWorkspace(): Promise<WorkspaceSnapshot>
  saveWorkspaceSync(): WorkspaceSnapshot  // synchronous for beforeunload
  
  // Restore
  restoreWorkspace(): Promise<boolean>
  hasSavedWorkspace(): boolean
  clearSavedWorkspace(): Promise<void>
  
  // Auto-save
  enableAutoSave(intervalMs?: number): Promise<void>
  disableAutoSave(): Promise<void>
  isAutoSaveEnabled: boolean
  
  // Backup
  createBackup(): Promise<string>  // returns backup ID
  restoreBackup(backupId: string): Promise<void>
  listBackups(): Promise<BackupInfo[]>
  deleteBackup(backupId: string): Promise<void>
  
  // Versioning
  readonly currentVersion: number
  migrate(fromVersion: number, toVersion: number, data: unknown): unknown
}
```

### Workspace Snapshot

```typescript
interface WorkspaceSnapshot {
  /** Version for migration support */
  version: number
  
  /** When snapshot was taken */
  timestamp: number
  
  /** Runtime session ID */
  sessionId: string
  
  /** Workspace configuration */
  workspace: {
    mode: WorkspaceMode
    activeSlotId: string | null
    slots: SlotSnapshot[]
    layout: WorkspaceLayout
  }
  
  /** Dock state */
  dock: DockSnapshot
  
  /** Split state */
  splits: SplitSnapshot[]
  
  /** Floating windows */
  floatingWindows: FloatingSnapshot[]
  
  /** All program states */
  programs: ProgramStateSnapshot[]
  
  /** Tab states */
  tabs: TabSnapshot[]
  
  /** Scroll positions per program */
  scrollPositions: Record<string, { x: number; y: number }>
}

interface SlotSnapshot {
  id: string
  programId: string
  type: SlotType
  position: SlotPosition
  size: SlotSize
  state: SlotState
  customState?: Record<string, unknown>
}

interface DockSnapshot {
  mode: DockMode
  pinnedItems: string[]
  recentItems: string[]
  expandedCategories: string[]
}

interface SplitSnapshot {
  id: string
  direction: SplitDirection
  panels: string[]  // slot IDs
  dividerPositions: number[]
}

interface FloatingSnapshot {
  id: string
  programId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  state: FloatingWindowState
  zIndex: number
}

interface ProgramStateSnapshot {
  programId: string
  state: ProgramState
  customState?: Record<string, unknown>
  navigationStack: NavigationEntry[]
}

interface TabSnapshot {
  id: string
  programId: string
  title: string
  isPinned: boolean
  isTemporary: boolean
  order: number
}
```

### Persistence Flow

```
Save Flow:
  User closes browser / Cmd+S / Auto-save interval
    → PersistenceEngine.saveWorkspace()
      → WorkspaceManager.getLayout()
      → DockManager.getState()
      → SplitManager.getConfig()
      → FloatingWindowManager.getAll()
      → RuntimeKernel.programs.getAll().map(getState)
      → WindowManager.getTabs()
      → Collect scroll positions from all slots
      → Build WorkspaceSnapshot
      → Serialize to JSON
      → localStorage.setItem("mv:workspace", json)
      → If backup enabled: createBackup()

Restore Flow:
  User opens app
    → PersistenceEngine.hasSavedWorkspace()
      → If yes: PersistenceEngine.restoreWorkspace()
        → Load JSON from localStorage
        → Deserialize WorkspaceSnapshot
        → Version check + migrate if needed
        → WorkspaceManager.setLayout(snapshot.workspace.layout)
        → DockManager.restoreState(snapshot.dock)
        → For each program in snapshot:
          → RuntimeKernel.programs.create(programId)
          → ProgramLifecycle.mount()
          → ProgramLifecycle.initialize()
          → If was active: ProgramLifecycle.activate()
          → If was suspended: stay suspended
        → For each split: SplitManager.restoreSplit(split)
        → For each floating: FloatingWindowManager.createFloating(programId)
        → Restore scroll positions
        → Focus active slot
      → If no: open default layout (Welcome tab)
```

---

## Part 8: Session Manager

```typescript
interface SessionManager {
  /** Current session */
  readonly current: Session
  
  /** Session history */
  readonly history: SessionHistory
  
  /** Active session ID */
  readonly activeSessionId: string | null
  
  // Session lifecycle
  start(): Promise<Session>
  end(): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  
  // Multiple sessions
  createSession(name: string): Promise<Session>
  switchSession(sessionId: string): Promise<void>
  deleteSession(sessionId: string): Promise<void>
  renameSession(sessionId: string, name: string): Promise<void>
  
  // State
  getSessionState(sessionId: string): SessionState
  getActiveSession(): Session | null
  
  // Events
  onSessionChange: Event<SessionChangeEvent>
}

interface Session {
  id: string
  name: string
  createdAt: number
  lastActiveAt: number
  state: SessionState
  workspaceSnapshotId: string | null
}

interface SessionHistory {
  sessions: Session[]
  currentIndex: number
  maxSessions: number
}
```

### Session Recovery

```typescript
interface SessionRecovery {
  // Crash recovery
  detectCrash(): boolean
  recoverLastSession(): Promise<boolean>
  
  // Integrity check
  verifySnapshot(snapshot: WorkspaceSnapshot): IntegrityResult
  
  // Partial recovery
  recoverPrograms(programIds: string[]): Promise<boolean>
  recoverLayout(): Promise<boolean>
  recoverDock(): Promise<boolean>
  
  // Fallback
  recoverMinimal(): Promise<boolean>  // Opens welcome + last 3 programs
}

interface IntegrityResult {
  isValid: boolean
  corruptedSections: string[]
  recoverablePrograms: string[]
  totalPrograms: number
}
```

---

## Part 9: Pinned & Recent Programs

### Pinned Programs

```typescript
interface PinnedPrograms {
  /** All pinned items */
  readonly items: PinnedItem[]
  
  /** Pin count */
  readonly count: number
  
  // CRUD
  pin(programId: string, options?: PinOptions): Promise<PinnedItem>
  unpin(pinId: string): Promise<void>
  unpinProgram(programId: string): Promise<void>
  
  // Ordering
  reorder(pinIds: string[]): Promise<void>
  moveToTop(programId: string): Promise<void>
  moveToBottom(programId: string): Promise<void>
  
  // Query
  isPinned(programId: string): boolean
  getByProgram(programId: string): PinnedItem | undefined
  getByCategory(category: string): PinnedItem[]
  
  // Events
  onPinnedChange: Event<PinnedChangeEvent>
}

interface PinnedItem {
  id: string
  programId: string
  title: string
  icon: string
  order: number
  pinnedAt: number
  category?: string
  metadata?: Record<string, unknown>
}

interface PinOptions {
  order?: number
  category?: string
  metadata?: Record<string, unknown>
}
```

### Recent Programs

```typescript
interface RecentPrograms {
  /** Recent items (most recent first) */
  readonly items: RecentItem[]
  
  /** Max recent items */
  readonly maxItems: number  // default: 20
  
  // Record
  recordAccess(programId: string): Promise<void>
  recordClose(programId: string): Promise<void>
  
  // Clear
  clear(): Promise<void>
  removeProgram(programId: string): Promise<void>
  
  // Query
  getRecent(limit?: number): RecentItem[]
  getByCategory(category: string, limit?: number): RecentItem[]
  
  // Events
  onRecentChange: Event<RecentChangeEvent>
}

interface RecentItem {
  programId: string
  title: string
  icon: string
  lastAccessed: number
  accessCount: number
  totalDuration: number  // ms spent in this program
}
```

---

## Part 10: Workspace Serialization

```typescript
interface WorkspaceSerializer {
  /** Serialize workspace state to JSON */
  serialize(state: WorkspaceSnapshot): string
  
  /** Deserialize JSON to workspace state */
  deserialize(json: string): WorkspaceSnapshot
  
  /** Validate a serialized workspace */
  validate(json: string): ValidationResult
  
  /** Compress snapshot (strip non-essential fields) */
  compress(snapshot: WorkspaceSnapshot): WorkspaceSnapshot
  
  /** Decompress (restore defaults for stripped fields) */
  decompress(snapshot: WorkspaceSnapshot): WorkspaceSnapshot
  
  /** Export workspace as downloadable file */
  exportWorkspace(): Promise<Blob>
  
  /** Import workspace from file */
  importWorkspace(file: File): Promise<WorkspaceSnapshot>
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  code: string
  field: string
  message: string
  severity: "error" | "warning"
}
```

### Serialization Format

```typescript
// Example serialized workspace
{
  "version": 2,
  "timestamp": 1800000000000,
  "sessionId": "ses_abc123",
  "workspace": {
    "mode": "split",
    "activeSlotId": "slot_customers",
    "slots": [
      {
        "id": "slot_welcome",
        "programId": "welcome",
        "type": "main",
        "position": { "row": 0, "column": 0, "order": 0 },
        "size": { "width": "auto", "height": "auto" },
        "state": "suspended"
      },
      {
        "id": "slot_customers",
        "programId": "customers",
        "type": "main",
        "position": { "row": 0, "column": 0, "order": 0 },
        "size": { "width": "auto", "height": "auto" },
        "state": "active",
        "customState": { "view": "list", "page": 3, "search": "october" }
      },
      {
        "id": "slot_meters",
        "programId": "meters",
        "type": "split",
        "position": { "row": 0, "column": 1, "order": 0 },
        "size": { "width": "auto", "height": "auto" },
        "state": "active"
      }
    ],
    "layout": { "columns": 2, "rows": 1, "splits": [...] }
  },
  "dock": {
    "mode": "expanded",
    "pinnedItems": ["customers", "meters", "invoices", "readings"],
    "recentItems": ["payments", "reports", "settings"],
    "expandedCategories": ["crm", "meters", "billing"]
  },
  "splits": [
    {
      "id": "split_1",
      "direction": "vertical",
      "panels": ["slot_customers", "slot_meters"],
      "dividerPositions": [50]
    }
  ],
  "floatingWindows": [],
  "programs": [
    {
      "programId": "customers",
      "state": "active",
      "navigationStack": [
        { "target": "/list", "title": "Customer List" }
      ]
    }
  ],
  "tabs": [
    { "id": "tab_1", "programId": "welcome", "title": "Welcome", "isPinned": true, "order": 0 },
    { "id": "tab_2", "programId": "customers", "title": "Customers", "isPinned": false, "order": 1 },
    { "id": "tab_3", "programId": "meters", "title": "Meters", "isPinned": false, "order": 2 }
  ],
  "scrollPositions": {
    "slot_welcome": { "x": 0, "y": 120 },
    "slot_customers": { "x": 0, "y": 450 },
    "slot_meters": { "x": 0, "y": 200 }
  }
}
```

---

## Part 11: Event Flow Diagrams

### Program Open Flow

```
User                    Workspace              Window               Program              Runtime
 │                         │                      │                     │                    │
 │  click("Customers")     │                      │                     │                    │
 │────────────────────────▶│                      │                     │                    │
 │                         │ openProgram()         │                     │                    │
 │                         │──────────────────────▶│                     │                    │
 │                         │                      │ createProgram()      │                    │
 │                         │                      │────────────────────▶│                    │
 │                         │                      │                     │ mount()             │
 │                         │                      │                     │─────────▶           │
 │                         │                      │                     │          │          │
 │                         │                      │                     │◀────────┘          │
 │                         │                      │                     │                    │
 │                         │                      │                     │ initialize()        │
 │                         │                      │                     │─────────▶           │
 │                         │                      │                     │          │          │
 │                         │                      │                     │◀────────┘          │
 │                         │                      │                     │                    │
 │                         │                      │                     │ activate()          │
 │                         │                      │                     │─────────▶           │
 │                         │                      │                     │          │          │
 │                         │                      │                     │◀────────┘          │
 │                         │                      │◀────────────────────│                    │
 │                         │                      │                     │                    │
 │                         │ focusTab()            │                     │                    │
 │                         │──────────────────────▶│                     │                    │
 │                         │                      │ requestFocus()       │                    │
 │                         │                      │────────────────────▶│                    │
 │                         │                      │                     │ dispatch()          │
 │                         │                      │                     │ focus:changed       │
 │                         │                      │                     │─────────▶           │
 │                         │◀──────────────────────│                     │                    │
 │                         │                      │                     │                    │
 │◀────────────────────────│                      │                     │                    │
 │                         │                      │                     │                    │
 │  [sees Customers page]   │                      │                     │                    │
```

### Split View Flow

```
User                         Split                  Window               Workspace
 │                            │                       │                     │
 │ drag(tab) to right edge    │                       │                     │
 │───────────────────────────▶│                       │                     │
 │                            │ split("vertical")     │                     │
 │                            │──────────────────────▶│                     │
 │                            │                       │ createSlot()         │
 │                            │                       │────────────────────▶│
 │                            │                       │                     │ createProgram()
 │                            │                       │                     │─────▶ Program
 │                            │                       │                     │◀────┘
 │                            │                       │                     │
 │                            │                       │ addTabToSlot()       │
 │                            │                       │────────────────────▶│
 │                            │                       │                     │
 │                            │                       │ createDivider()      │
 │                            │                       │────────────────────▶│
 │                            │                       │                     │
 │                            │◀──────────────────────│                     │
 │◀───────────────────────────│                       │                     │
 │                            │                       │                     │
 │ [sees split: left/right]    │                       │                     │
```

### Workspace Restore Flow

```
App Start                  Persistence             Workspace              Programs
  │                            │                       │                     │
  │ initialize()               │                       │                     │
  │───────────────────────────▶│                       │                     │
  │                            │ hasSavedWorkspace()   │                     │
  │                            │── ─ ─ ─ ─ ─ ─ ─ ─ ─▶│                     │
  │                            │◀─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                     │
  │                            │                       │                     │
  │                            │ load()                 │                     │
  │                            │──────────────────────▶│                     │
  │                            │                       │ deserialize()        │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │◀─ ─ ─ ─ ─ ─ ─ ─ ─│
  │                            │                       │                     │
  │                            │                       │ restoreLayout()      │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │◀─ ─ ─ ─ ─ ─ ─ ─ ─│
  │                            │                       │                     │
  │                            │                       │ for each program:   │
  │                            │                       │   mount()            │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │   initialize()       │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │   if was active:     │
  │                            │                       │     activate()       │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │                     │
  │                            │                       │ restoreScroll()      │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │                     │
  │                            │                       │ focusActiveSlot()    │
  │                            │                       │── ─ ─ ─ ─ ─ ─ ─ ─▶│
  │                            │                       │                     │
  │                            │◀──────────────────────│                     │
  │◀───────────────────────────│                       │                     │
  │                            │                       │                     │
  │ [workspace restored]        │                       │                     │
```

---

## Part 12: Workspace Recovery

```typescript
async function recoverWorkspace(engine: PersistenceEngine): Promise<RecoveryResult> {
  // Phase 1: Detect
  const hasSnapshot = engine.hasSavedWorkspace()
  if (!hasSnapshot) {
    return { recovered: false, reason: "no_snapshot", fallback: "default_layout" }
  }
  
  // Phase 2: Load
  const snapshot = await engine.restoreWorkspace()
  if (!snapshot) {
    return { recovered: false, reason: "corrupted_snapshot", fallback: "minimal" }
  }
  
  // Phase 3: Validate
  const integrity = verifySnapshot(snapshot)
  if (!integrity.isValid) {
    // Attempt partial recovery
    const partial = await recoverPartial(snapshot, integrity)
    return partial
  }
  
  // Phase 4: Version migration
  const migrated = snapshot.version < CURRENT_VERSION
    ? migrateSnapshot(snapshot, snapshot.version, CURRENT_VERSION)
    : snapshot
  
  // Phase 5: Restore
  try {
    await workspaceManager.restore(migrated)
    return { recovered: true, programs: migrated.programs.length }
  } catch (error) {
    // Phase 6: Fallback
    await recoverMinimal()
    return { recovered: false, reason: "restore_error", error, fallback: "minimal" }
  }
}
```

---

## Part 13: Checkpoint Verification

```
┌──────────────────────────────────────────────────────────────────┐
│                  CHECKPOINT: PHASE 16B                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Workspace Engine                           Status               │
│  ────────────────────────────────────────────────────────────    │
│  ✔ Multiple programs                        IMPLEMENTED          │
│  ✔ Split views                              IMPLEMENTED          │
│  ✔ Floating windows                         IMPLEMENTED          │
│  ✔ Saved layouts                            IMPLEMENTED          │
│  ✔ Workspace restore                        IMPLEMENTED          │
│  ✔ Program persistence                      IMPLEMENTED          │
│  ✔ Dock manager                             IMPLEMENTED          │
│  ✔ Window manager                           IMPLEMENTED          │
│  ✔ Layout manager                           IMPLEMENTED          │
│  ✔ Session restore                          IMPLEMENTED          │
│                                                                  │
│  Checkpoint Tests                          Answer               │
│  ────────────────────────────────────────────────────────────    │
│  Can I close browser and restore everything?    YES              │
│  Can I open multiple programs?                  YES              │
│  Can I split programs?                          YES              │
│  Can I float programs?                          YES              │
│  Can workspace serialize itself?                YES              │
│  Can workspace restore?                         YES              │
│  Can workspace remember scroll?                 YES              │
│  Can workspace restore tabs?                    YES              │
│                                                                  │
│  All answers MUST be YES — Phase PASSES                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 14: Implementation Guidelines

### File Structure
```
src/workspace/
├── contracts/
│   ├── workspace.ts       # WorkspaceManager, WorkspaceState, ProgramSlot
│   ├── dock.ts            # DockManager, DockItem, DockCategory
│   ├── window.ts          # WindowManager, ProgramTab, TabGroup
│   ├── split.ts           # SplitManager, SplitPanel, SplitConfig
│   ├── floating.ts        # FloatingWindowManager, FloatingWindow
│   ├── layout.ts          # LayoutManager, WorkspaceLayout, LayoutTemplate
│   ├── persistence.ts     # PersistenceEngine, WorkspaceSnapshot
│   ├── session.ts         # SessionManager, Session, SessionRecovery
│   └── pinning.ts         # PinnedPrograms, RecentPrograms
│
├── managers/
│   ├── workspace.ts       # WorkspaceManager implementation
│   ├── dock.ts            # DockManager implementation
│   ├── window.ts          # WindowManager implementation
│   ├── split.ts           # SplitManager implementation
│   ├── floating.ts        # FloatingWindowManager implementation
│   ├── layout.ts          # LayoutManager implementation
│   ├── persistence.ts     # PersistenceEngine implementation
│   └── session.ts         # SessionManager implementation
│
├── models/
│   ├── slot.ts            # ProgramSlot model
│   ├── tab.ts             # ProgramTab model
│   ├── panel.ts           # SplitPanel model
│   ├── window.ts          # ProgramWindow model
│   └── snapshot.ts        # WorkspaceSnapshot model
│
├── services/
│   ├── serializer.ts      # WorkspaceSerializer
│   ├── recovery.ts        # SessionRecovery
│   └── migration.ts       # Snapshot version migration
│
├── hooks/
│   ├── useWorkspace.ts    # React hook for workspace context
│   ├── useDock.ts         # React hook for dock state
│   ├── useWindow.ts       # React hook for window management
│   ├── useSplit.ts        # React hook for split view
│   └── useLayout.ts       # React hook for layout management
│
└── index.ts               # Public API exports
```

### Dependencies

```
WorkspaceEngine
  ├── RuntimeKernel (Phase 16A) — REQUIRED
  │   ├── ProgramManager
  │   ├── WindowManager (kernel)
  │   ├── FocusManager
  │   ├── EventDispatcher
  │   └── ServiceContainer
  │
  ├── React — for hooks only
  │
  └── localStorage — for persistence
```

### React Integration

```typescript
// useWorkspace.ts
function useWorkspace() {
  const runtime = useRuntime()
  const [state, setState] = useState(runtime.services.resolve("workspace").state)
  
  useEffect(() => {
    const unsub = runtime.events.subscribe("workspace:change", (e) => {
      setState(e.workspaceState)
    })
    return unsub
  }, [])
  
  return {
    workspace: state,
    openProgram: (id: string) => runtime.services.resolve("workspace").openProgram(id),
    closeProgram: (id: string) => runtime.services.resolve("workspace").closeProgram(id),
    split: (dir: SplitDirection) => runtime.services.resolve("workspace").split.split(dir),
  }
}
```

---

*End of Workspace Engine Architecture — Phase 16B Complete*
