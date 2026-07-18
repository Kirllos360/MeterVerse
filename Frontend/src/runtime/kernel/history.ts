import { TypedEvent } from "./events"
import type { NavigationState } from "../contracts/runtime"

export interface HistoryEntry {
  id: string
  timestamp: number
  type: "navigation" | "program" | "selection" | "action"
  navigationState?: NavigationState
  title: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface HistoryChangeEvent {
  entry: HistoryEntry
  currentIndex: number
  totalEntries: number
}

export interface HistoryQuery {
  types?: string[]
  fromTimestamp?: number
  toTimestamp?: number
  limit?: number
}

export interface HistoryManager {
  readonly entries: HistoryEntry[]
  readonly currentIndex: number
  readonly length: number
  readonly canGoBack: boolean
  readonly canGoForward: boolean
  readonly maxEntries: number

  push(entry: HistoryEntry): void
  replace(entry: HistoryEntry): void
  goBack(): HistoryEntry | null
  goForward(): HistoryEntry | null
  goTo(index: number): HistoryEntry | null
  clear(): void
  search(_query: string): HistoryEntry[]

  onChange: TypedEvent<HistoryChangeEvent>
}

export class RuntimeHistoryManager implements HistoryManager {
  private _entries: HistoryEntry[] = []
  private _currentIndex = -1
  readonly maxEntries = 100

  onChange = new TypedEvent<HistoryChangeEvent>()

  get entries(): HistoryEntry[] { return [...this._entries] }
  get currentIndex(): number { return this._currentIndex }
  get length(): number { return this._entries.length }
  get canGoBack(): boolean { return this._currentIndex > 0 }
  get canGoForward(): boolean { return this._currentIndex < this._entries.length - 1 }

  push(entry: HistoryEntry): void {
    if (this._currentIndex < this._entries.length - 1) {
      this._entries = this._entries.slice(0, this._currentIndex + 1)
    }
    this._entries.push(entry)
    this._currentIndex++
    if (this._entries.length > this.maxEntries) { this._entries.shift(); this._currentIndex-- }
    this.onChange.dispatch({ entry, currentIndex: this._currentIndex, totalEntries: this._entries.length })
  }

  replace(entry: HistoryEntry): void {
    if (this._currentIndex >= 0 && this._currentIndex < this._entries.length) {
      this._entries[this._currentIndex] = entry
    }
  }

  goBack(): HistoryEntry | null {
    if (!this.canGoBack) return null
    this._currentIndex--
    const entry = this._entries[this._currentIndex]
    this.onChange.dispatch({ entry, currentIndex: this._currentIndex, totalEntries: this._entries.length })
    return entry
  }

  goForward(): HistoryEntry | null {
    if (!this.canGoForward) return null
    this._currentIndex++
    const entry = this._entries[this._currentIndex]
    this.onChange.dispatch({ entry, currentIndex: this._currentIndex, totalEntries: this._entries.length })
    return entry
  }

  goTo(index: number): HistoryEntry | null {
    if (index < 0 || index >= this._entries.length) return null
    this._currentIndex = index
    const entry = this._entries[index]
    this.onChange.dispatch({ entry, currentIndex: this._currentIndex, totalEntries: this._entries.length })
    return entry
  }

  clear(): void {
    this._entries = []
    this._currentIndex = -1
  }

  search(_query: string): HistoryEntry[] {
    const q = _query.toLowerCase()
    return this._entries.filter((e) => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
  }
}
