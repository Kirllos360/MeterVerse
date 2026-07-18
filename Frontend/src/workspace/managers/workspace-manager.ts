import type { WorkspaceState, WorkspaceMode, ProgramSlot, WorkspaceLayout, SlotState, SlotType, SlotPosition, SlotSize, WorkspaceSnapshot } from "../contracts/workspace"
import type { ProgramContract } from "@/runtime/contracts/program"
import type { RuntimeContext } from "@/runtime/contracts/runtime"
import { TypedEvent } from "@/runtime/kernel/events"

export interface WorkspaceManager {
  readonly state: WorkspaceState
  initialize(runtime: RuntimeContext): Promise<void>
  destroy(): Promise<void>
  openProgram(programId: string, options?: { focus?: boolean }): Promise<ProgramSlot>
  closeProgram(slotId: string): Promise<void>
  focusProgram(slotId: string): Promise<void>
  setMode(mode: WorkspaceMode): Promise<void>
  setLayout(layout: WorkspaceLayout): Promise<void>
  getLayout(): WorkspaceLayout
  save(): WorkspaceSnapshot
  restore(snapshot: WorkspaceSnapshot): Promise<void>
  onWorkspaceChange: TypedEvent<Partial<WorkspaceState>>
}

export class WorkspaceManagerImpl implements WorkspaceManager {
  private _state: WorkspaceState
  private runtime!: RuntimeContext
  private slotCounter = 0
  onWorkspaceChange = new TypedEvent<Partial<WorkspaceState>>()

  constructor() {
    this._state = {
      mode: "single",
      activeSlotId: null,
      slots: [],
      layout: this.createDefaultLayout(),
      dock: { mode: "expanded", pinnedItems: [], recentItems: [], expandedCategories: [] },
      session: { id: `sess_${Date.now()}`, startedAt: Date.now(), lastActivityAt: Date.now() },
    }
  }

  get state() { return this._state }

  async initialize(runtime: RuntimeContext): Promise<void> {
    this.runtime = runtime
  }

  async destroy(): Promise<void> {
    for (const slot of this._state.slots) {
      await slot.program.destroy()
    }
    this._state.slots = []
    this._state.activeSlotId = null
  }

  async openProgram(programId: string, options?: { focus?: boolean }): Promise<ProgramSlot> {
    const existing = this._state.slots.find((s) => s.program.id === programId && s.type === "main")
    if (existing) {
      if (options?.focus !== false) await this.focusProgram(existing.id)
      return existing
    }

    const slot = await this.createSlot(programId, "main")
    this._state.slots.push(slot)
    this._state.activeSlotId = slot.id
    this._state.session.lastActivityAt = Date.now()
    this.onWorkspaceChange.dispatch({ slots: this._state.slots, activeSlotId: slot.id })
    return slot
  }

  async closeProgram(slotId: string): Promise<void> {
    const idx = this._state.slots.findIndex((s) => s.id === slotId)
    if (idx === -1) return
    const slot = this._state.slots[idx]
    await slot.program.destroy()
    this._state.slots.splice(idx, 1)
    if (this._state.activeSlotId === slotId) {
      this._state.activeSlotId = this._state.slots[idx]?.id ?? this._state.slots[idx - 1]?.id ?? null
    }
    this.onWorkspaceChange.dispatch({ slots: this._state.slots, activeSlotId: this._state.activeSlotId })
  }

  async focusProgram(slotId: string): Promise<void> {
    this._state.activeSlotId = slotId
    this._state.session.lastActivityAt = Date.now()
    this._state.slots.forEach((s) => s.isFocused = s.id === slotId)
    this.onWorkspaceChange.dispatch({ activeSlotId: slotId })
  }

  async setMode(mode: WorkspaceMode): Promise<void> {
    this._state.mode = mode
    this.onWorkspaceChange.dispatch({ mode })
  }

  async setLayout(layout: WorkspaceLayout): Promise<void> {
    this._state.layout = layout
    this.onWorkspaceChange.dispatch({ layout })
  }

  getLayout(): WorkspaceLayout {
    return { ...this._state.layout }
  }

  save(): WorkspaceSnapshot {
    return {
      version: 1,
      timestamp: Date.now(),
      workspace: {
        mode: this._state.mode,
        activeSlotId: this._state.activeSlotId,
        slots: this._state.slots.map((s) => ({
          id: s.id, programId: s.program.id, type: s.type,
          position: { ...s.position }, size: { ...s.size }, state: s.state,
        })),
        layout: this._state.layout,
      },
      dock: { mode: this._state.dock.mode, pinnedItems: [...this._state.dock.pinnedItems], recentItems: [...this._state.dock.recentItems], expandedCategories: [...this._state.dock.expandedCategories] },
      splits: [],
      floatingWindows: [],
      tabs: this._state.slots.map((s, i) => ({
        id: `tab_${s.id}`, programId: s.program.id, title: s.program.metadata?.title || s.program.id,
        isPinned: false, isTemporary: false, order: i,
      })),
      scrollPositions: {},
    }
  }

  async restore(snapshot: WorkspaceSnapshot): Promise<void> {
    this._state.mode = snapshot.workspace.mode
    this._state.dock = { mode: snapshot.dock.mode, pinnedItems: snapshot.dock.pinnedItems, recentItems: snapshot.dock.recentItems, expandedCategories: snapshot.dock.expandedCategories }
    this._state.layout = snapshot.workspace.layout
    this._state.activeSlotId = snapshot.workspace.activeSlotId
  }

  private async createSlot(programId: string, type: SlotType): Promise<ProgramSlot> {
    const id = `slot_${programId}_${++this.slotCounter}`
    const program = await this.runtime.programs.create(programId, {
      programId, context: this.runtime,
      setTitle: () => {}, setIcon: () => {}, setBadge: () => {}, setDirty: () => {},
      requestFocus: async () => true, close: async () => this.closeProgram(id),
      minimize: async () => {}, navigate: async () => {}, openProgram: async (pid) => this.runtime.programs.create(pid, null!),
    })
    return {
      id, program, type,
      position: { row: 0, column: 0, order: this._state.slots.length },
      size: { width: "auto", height: "auto" },
      state: "active", isFocused: false, metadata: {},
    }
  }

  private createDefaultLayout(): WorkspaceLayout {
    return {
      id: "default", name: "Default", type: "single",
      columns: 1, rows: 1, splits: [], windows: [],
      dock: { mode: "expanded", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: true, width: 360, activeSection: "details" },
    }
  }
}
