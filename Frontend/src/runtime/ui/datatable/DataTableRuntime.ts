"use client"

import { create } from "zustand"
import type { ReactNode } from "react"

export interface ColumnMeta<T> {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  hidden?: boolean
  frozen?: "left" | "right"
  align?: "left" | "center" | "right"
  aggregate?: "sum" | "avg" | "count" | "min" | "max"
  groupKey?: boolean
}

export interface TableState {
  search: string
  page: number
  pageSize: number
  sortColumn: string | null
  sortDirection: "asc" | "desc"
  selectedRows: Set<string>
  columnWidths: Record<string, number>
  columnOrder: string[]
  columnVisibility: Record<string, boolean>
  groupBy: string | null
  density: "comfortable" | "compact" | "ultraCompact"
}

export interface DataTableRuntimeAPI<T> {
  state: TableState
  columns: ColumnMeta<T>[]
  data: T[]
  filteredData: T[]
  groupedData: Record<string, T[]>
  totalPages: number
  visibleColumns: ColumnMeta<T>[]
  setSearch: (s: string) => void
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  toggleSort: (col: string) => void
  toggleRowSelection: (id: string) => void
  toggleAllSelection: () => void
  setColumnWidth: (col: string, width: number) => void
  toggleColumnVisibility: (col: string) => void
  reorderColumns: (from: number, to: number) => void
  setGroupBy: (col: string | null) => void
  setDensity: (d: TableState["density"]) => void
  reset: () => void
}

export function createDataTableRuntime<T extends { id: string | number }>(
  columns: ColumnMeta<T>[],
  data: T[],
  initialState?: Partial<TableState>
) {
  const defaultState: TableState = {
    search: "",
    page: 0,
    pageSize: 25,
    sortColumn: null,
    sortDirection: "asc",
    selectedRows: new Set(),
    columnWidths: {},
    columnOrder: columns.map((c) => c.id),
    columnVisibility: Object.fromEntries(columns.map((c) => [c.id, !c.hidden])),
    groupBy: null,
    density: "comfortable",
    ...initialState,
  }

  const store = create<DataTableRuntimeAPI<T>>((set, get) => ({
    state: defaultState,
    columns,
    data,

    get filteredData() {
      const { state } = get()
      let filtered = [...get().data]
      if (state.search) {
        const q = state.search.toLowerCase()
        filtered = filtered.filter((row) =>
          columns.some((col) => String(col.accessor(row) ?? "").toLowerCase().includes(q))
        )
      }
      if (state.sortColumn) {
        filtered.sort((a, b) => {
          const aVal = String(columns.find((c) => c.id === state.sortColumn)?.accessor(a) ?? "")
          const bVal = String(columns.find((c) => c.id === state.sortColumn)?.accessor(b) ?? "")
          return state.sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        })
      }
      return filtered
    },

    get groupedData() {
      const { state, filteredData } = get()
      if (!state.groupBy) return { "": filteredData }
      const groups: Record<string, T[]> = {}
      filteredData.forEach((row) => {
        const key = String(columns.find((c) => c.id === state.groupBy)?.accessor(row) ?? "Unknown")
        if (!groups[key]) groups[key] = []
        groups[key].push(row)
      })
      return groups
    },

    get totalPages() {
      return Math.ceil(get().filteredData.length / get().state.pageSize)
    },

    get visibleColumns() {
      return columns.filter((c) => get().state.columnVisibility[c.id] !== false)
    },

    setSearch: (search) => set((s) => ({ state: { ...s.state, search, page: 0 } })),
    setPage: (page) => set((s) => ({ state: { ...s.state, page } })),
    setPageSize: (pageSize) => set((s) => ({ state: { ...s.state, pageSize, page: 0 } })),
    toggleSort: (col) => set((s) => ({
      state: {
        ...s.state,
        sortColumn: s.state.sortColumn === col ? col : col,
        sortDirection: s.state.sortColumn === col ? (s.state.sortDirection === "asc" ? "desc" : "asc") : "asc",
      }
    })),
    toggleRowSelection: (id) => set((s) => {
      const next = new Set(s.state.selectedRows)
      next.has(id) ? next.delete(id) : next.add(id)
      return { state: { ...s.state, selectedRows: next } }
    }),
    toggleAllSelection: () => set((s) => {
      const { filteredData } = get()
      const allSelected = s.state.selectedRows.size === filteredData.length
      return { state: { ...s.state, selectedRows: allSelected ? new Set() : new Set(filteredData.map((r) => String(r.id))) } }
    }),
    setColumnWidth: (col, width) => set((s) => ({ state: { ...s.state, columnWidths: { ...s.state.columnWidths, [col]: width } } })),
    toggleColumnVisibility: (col) => set((s) => ({ state: { ...s.state, columnVisibility: { ...s.state.columnVisibility, [col]: !s.state.columnVisibility[col] } } })),
    reorderColumns: (from, to) => set((s) => {
      const order = [...s.state.columnOrder]
      const [moved] = order.splice(from, 1)
      order.splice(to, 0, moved)
      return { state: { ...s.state, columnOrder: order } }
    }),
    setGroupBy: (groupBy) => set((s) => ({ state: { ...s.state, groupBy } })),
    setDensity: (density) => set((s) => ({ state: { ...s.state, density } })),
    reset: () => set({ state: defaultState }),
  }))

  return store
}
