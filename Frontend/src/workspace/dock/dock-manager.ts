import type { DockMode, DockState, DockSnapshot } from "../contracts/workspace"
import { TypedEvent } from "@/runtime/kernel/events"

export interface DockItem {
  id: string
  programId: string
  title: string
  icon: string
  category: string
  isPinned: boolean
  isActive: boolean
  hasBadge: boolean
  badgeCount?: number
  lastAccessed: number
  accessCount: number
}

export interface DockCategory {
  id: string
  title: string
  icon: string
  order: number
  isExpanded: boolean
  items: DockItem[]
  itemCount: number
}

export interface DockChangeEvent {
  type: "modeChanged" | "itemAdded" | "itemRemoved" | "itemPinned" | "itemUnpinned" | "categoryExpanded"
  state: DockState
}

export interface DockManager {
  readonly state: DockState
  readonly items: DockItem[]
  setMode(mode: DockMode): Promise<void>
  toggle(): Promise<void>
  expand(): Promise<void>
  collapse(): Promise<void>
  pinItem(programId: string): Promise<void>
  unpinItem(programId: string): Promise<void>
  isPinned(programId: string): boolean
  recordAccess(programId: string): void
  getRecentItems(limit?: number): DockItem[]
  setCategoryExpanded(categoryId: string, expanded: boolean): Promise<void>
  restoreState(snapshot: DockSnapshot): void
  getState(): DockSnapshot
  onDockChange: TypedEvent<DockChangeEvent>
}

export class DockManagerImpl implements DockManager {
  private _state: DockState
  private _items: Map<string, DockItem> = new Map()
  private _recent: string[] = []
  onDockChange = new TypedEvent<DockChangeEvent>()

  constructor() {
    this._state = { mode: "expanded", pinnedItems: [], recentItems: [], expandedCategories: [] }
  }

  get state() { return this._state }
  get items() { return Array.from(this._items.values()) }

  async setMode(mode: DockMode): Promise<void> {
    this._state.mode = mode
    this.onDockChange.dispatch({ type: "modeChanged", state: this._state })
  }

  async toggle(): Promise<void> {
    const modes: DockMode[] = ["expanded", "collapsed", "dock"]
    const idx = modes.indexOf(this._state.mode)
    await this.setMode(modes[(idx + 1) % modes.length])
  }

  async expand(): Promise<void> { await this.setMode("expanded") }
  async collapse(): Promise<void> { await this.setMode("collapsed") }

  async pinItem(programId: string): Promise<void> {
    if (!this._state.pinnedItems.includes(programId)) {
      this._state.pinnedItems.push(programId)
      if (this._items.has(programId)) this._items.get(programId)!.isPinned = true
      this.onDockChange.dispatch({ type: "itemPinned", state: this._state })
    }
  }

  async unpinItem(programId: string): Promise<void> {
    this._state.pinnedItems = this._state.pinnedItems.filter((id) => id !== programId)
    if (this._items.has(programId)) this._items.get(programId)!.isPinned = false
    this.onDockChange.dispatch({ type: "itemUnpinned", state: this._state })
  }

  isPinned(programId: string): boolean {
    return this._state.pinnedItems.includes(programId)
  }

  recordAccess(programId: string): void {
    const existing = this._items.get(programId)
    if (existing) {
      existing.lastAccessed = Date.now()
      existing.accessCount++
    }
    this._recent = this._recent.filter((id) => id !== programId)
    this._recent.unshift(programId)
    if (this._recent.length > 20) this._recent.pop()
    this._state.recentItems = [...this._recent]
  }

  getRecentItems(limit = 10): DockItem[] {
    return this._recent.slice(0, limit).map((id) => this._items.get(id)).filter(Boolean) as DockItem[]
  }

  async setCategoryExpanded(categoryId: string, expanded: boolean): Promise<void> {
    if (expanded && !this._state.expandedCategories.includes(categoryId)) {
      this._state.expandedCategories.push(categoryId)
    } else {
      this._state.expandedCategories = this._state.expandedCategories.filter((id) => id !== categoryId)
    }
    this.onDockChange.dispatch({ type: "categoryExpanded", state: this._state })
  }

  restoreState(snapshot: DockSnapshot): void {
    this._state.mode = snapshot.mode
    this._state.pinnedItems = [...snapshot.pinnedItems]
    this._state.recentItems = [...snapshot.recentItems]
    this._state.expandedCategories = [...snapshot.expandedCategories]
  }

  getState(): DockSnapshot {
    return {
      mode: this._state.mode,
      pinnedItems: [...this._state.pinnedItems],
      recentItems: [...this._state.recentItems],
      expandedCategories: [...this._state.expandedCategories],
    }
  }
}
