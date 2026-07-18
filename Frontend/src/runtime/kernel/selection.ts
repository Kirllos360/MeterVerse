import { TypedEvent } from "./events"

export interface SelectableEntity {
  id: string
  type: string
  label?: string
}

export interface SelectionSet {
  entities: SelectableEntity[]
  total: number
}

export interface SelectionEntry {
  entities: SelectableEntity[]
  source?: string
  timestamp: number
}

export interface SelectionChangeEvent {
  selection: SelectionSet
  added: SelectableEntity[]
  removed: SelectableEntity[]
  source?: string
}

export interface SelectionManager {
  readonly selection: SelectionSet
  readonly history: SelectionEntry[]

  select(entities: SelectableEntity[], source?: string): Promise<void>
  deselect(ids: string[], source?: string): Promise<void>
  clear(): Promise<void>
  selectAll(): Promise<void>
  isSelected(id: string): boolean
  getSelectedByType(type: string): SelectableEntity[]
  getSelectionCount(): number

  startBatch(): void
  endBatch(): Promise<void>

  onSelectionChange: TypedEvent<SelectionChangeEvent>
}

export class RuntimeSelectionManager implements SelectionManager {
  private _selection: SelectionSet = { entities: [], total: 0 }
  private _history: SelectionEntry[] = []
  private batchDepth = 0
  private pendingChanges: { entities: SelectableEntity[]; added: SelectableEntity[]; removed: SelectableEntity[]; source?: string } | null = null

  onSelectionChange = new TypedEvent<SelectionChangeEvent>()

  get selection(): SelectionSet { return { entities: [...this._selection.entities], total: this._selection.total } }
  get history(): SelectionEntry[] { return [...this._history] }

  async select(entities: SelectableEntity[], source?: string): Promise<void> {
    const added = entities.filter((e) => !this._selection.entities.find((s) => s.id === e.id))
    this._selection.entities.push(...added)
    this._selection.total = this._selection.entities.length

    if (this.batchDepth > 0) {
      if (!this.pendingChanges) this.pendingChanges = { entities: [], added: [], removed: [] }
      this.pendingChanges.entities.push(...entities)
      this.pendingChanges.added.push(...added)
      this.pendingChanges.source = source
      return
    }

    this._history.push({ entities: [...entities], source, timestamp: Date.now() })
    if (this._history.length > 50) this._history.shift()
    this.onSelectionChange.dispatch({ selection: this.selection, added, removed: [], source })
  }

  async deselect(ids: string[], source?: string): Promise<void> {
    const removed = this._selection.entities.filter((e) => ids.includes(e.id))
    this._selection.entities = this._selection.entities.filter((e) => !ids.includes(e.id))
    this._selection.total = this._selection.entities.length
    this.onSelectionChange.dispatch({ selection: this.selection, added: [], removed, source })
  }

  async clear(): Promise<void> {
    const removed = [...this._selection.entities]
    this._selection.entities = []
    this._selection.total = 0
    this.onSelectionChange.dispatch({ selection: this.selection, added: [], removed })
  }

  async selectAll(): Promise<void> {
    // Delegate to program to provide all selectable entities
  }

  isSelected(id: string): boolean {
    return this._selection.entities.some((e) => e.id === id)
  }

  getSelectedByType(type: string): SelectableEntity[] {
    return this._selection.entities.filter((e) => e.type === type)
  }

  getSelectionCount(): number {
    return this._selection.total
  }

  startBatch(): void {
    this.batchDepth++
  }

  async endBatch(): Promise<void> {
    this.batchDepth = Math.max(0, this.batchDepth - 1)
    if (this.batchDepth === 0 && this.pendingChanges) {
      const changes = this.pendingChanges
      this.pendingChanges = null
      this._history.push({ entities: changes.entities, source: changes.source, timestamp: Date.now() })
      if (this._history.length > 50) this._history.shift()
      this.onSelectionChange.dispatch({ selection: this.selection, added: changes.added, removed: changes.removed, source: changes.source })
    }
  }
}
