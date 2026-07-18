import { TypedEvent } from "@/runtime/kernel/events"

export interface WorkspaceTab {
  id: string
  programId: string
  title: string
  icon?: string
  isActive: boolean
  isPinned: boolean
  isDirty: boolean
  isTemporary: boolean
  canGoBack: boolean
  canGoForward: boolean
  scrollPosition: { x: number; y: number }
  createdAt: number
  lastAccessed: number
}

export interface TabChangeEvent {
  tabId: string
  programId: string
  action: "created" | "activated" | "deactivated" | "closed" | "pinned" | "unpinned" | "reordered"
}

export interface TabsManager {
  readonly tabs: WorkspaceTab[]
  readonly activeTabId: string | null
  readonly count: number

  createTab(programId: string, title: string, options?: { pinned?: boolean; temporary?: boolean }): WorkspaceTab
  closeTab(tabId: string): void
  closeOtherTabs(tabId: string): void
  closeAllTabs(): void
  activateTab(tabId: string): void
  pinTab(tabId: string): void
  unpinTab(tabId: string): void
  reorderTabs(tabIds: string[]): void
  duplicateTab(tabId: string): WorkspaceTab | undefined
  getTab(tabId: string): WorkspaceTab | undefined
  getTabByProgram(programId: string): WorkspaceTab | undefined

  onTabChange: TypedEvent<TabChangeEvent>
}

export class TabsManagerImpl implements TabsManager {
  private _tabs: WorkspaceTab[] = []
  private _activeTabId: string | null = null
  private _counter = 0
  onTabChange = new TypedEvent<TabChangeEvent>()

  get tabs() { return [...this._tabs] }
  get activeTabId() { return this._activeTabId }
  get count() { return this._tabs.length }

  createTab(programId: string, title: string, options?: { pinned?: boolean; temporary?: boolean }): WorkspaceTab {
    const id = `tab_${programId}_${++this._counter}`
    const tab: WorkspaceTab = {
      id, programId, title,
      isActive: false, isPinned: options?.pinned ?? false,
      isDirty: false, isTemporary: options?.temporary ?? false,
      canGoBack: false, canGoForward: false,
      scrollPosition: { x: 0, y: 0 },
      createdAt: Date.now(), lastAccessed: Date.now(),
    }
    this._tabs.push(tab)
    this.onTabChange.dispatch({ tabId: id, programId, action: "created" })
    return tab
  }

  closeTab(tabId: string): void {
    const idx = this._tabs.findIndex((t) => t.id === tabId)
    if (idx === -1) return
    const tab = this._tabs[idx]
    if (tab.isPinned) return
    this._tabs.splice(idx, 1)
    if (this._activeTabId === tabId) {
      this._activeTabId = this._tabs[Math.min(idx, this._tabs.length - 1)]?.id ?? null
      if (this._activeTabId) this._tabs.find((t) => t.id === this._activeTabId)!.isActive = true
    }
    this.onTabChange.dispatch({ tabId, programId: tab.programId, action: "closed" })
  }

  closeOtherTabs(tabId: string): void {
    this._tabs = this._tabs.filter((t) => t.id === tabId || t.isPinned)
    this._activeTabId = tabId
  }

  closeAllTabs(): void {
    this._tabs = this._tabs.filter((t) => t.isPinned)
    this._activeTabId = this._tabs[0]?.id ?? null
  }

  activateTab(tabId: string): void {
    this._tabs.forEach((t) => t.isActive = t.id === tabId)
    this._activeTabId = tabId
    const tab = this._tabs.find((t) => t.id === tabId)
    if (tab) {
      tab.lastAccessed = Date.now()
      this.onTabChange.dispatch({ tabId, programId: tab.programId, action: "activated" })
    }
  }

  pinTab(tabId: string): void {
    const tab = this._tabs.find((t) => t.id === tabId)
    if (tab) { tab.isPinned = true; this.onTabChange.dispatch({ tabId, programId: tab.programId, action: "pinned" }) }
  }

  unpinTab(tabId: string): void {
    const tab = this._tabs.find((t) => t.id === tabId)
    if (tab) { tab.isPinned = false; this.onTabChange.dispatch({ tabId, programId: tab.programId, action: "unpinned" }) }
  }

  reorderTabs(tabIds: string[]): void {
    const reordered = tabIds.map((id) => this._tabs.find((t) => t.id === id)).filter(Boolean) as WorkspaceTab[]
    const remaining = this._tabs.filter((t) => !tabIds.includes(t.id))
    this._tabs = [...reordered, ...remaining]
    this.onTabChange.dispatch({ tabId: "", programId: "", action: "reordered" })
  }

  duplicateTab(tabId: string): WorkspaceTab | undefined {
    const original = this._tabs.find((t) => t.id === tabId)
    if (!original) return undefined
    return this.createTab(original.programId, `${original.title} (copy)`, { pinned: false, temporary: true })
  }

  getTab(tabId: string): WorkspaceTab | undefined {
    return this._tabs.find((t) => t.id === tabId)
  }

  getTabByProgram(programId: string): WorkspaceTab | undefined {
    return this._tabs.find((t) => t.programId === programId)
  }
}
