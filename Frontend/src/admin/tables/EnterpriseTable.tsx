"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { PageSelector } from "./PageSelector"

export interface Column<T = any> {
  id: string
  header: string
  accessor: (row: T) => any
  width?: number
  minWidth?: number
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  pinned?: "left" | "right" | null
  align?: "left" | "center" | "right"
  format?: (value: any) => string
  aggregate?: "sum" | "avg" | "min" | "max" | "count"
}

interface EnterpriseTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  onRowClick?: (row: T) => void
  onCellEdit?: (row: T, columnId: string, value: any) => void
  onBulkAction?: (action: string, selectedIds: string[]) => void
  getId: (row: T) => string
  tableName?: string
}

export function EnterpriseTable<T>({ data, columns: initialColumns, pageSize = 25, onRowClick, onCellEdit, onBulkAction, getId, tableName = "table" }: EnterpriseTableProps<T>) {
  // ─── State ──────────────────────────────────────────────────────────────
  const [columns, setColumns] = useState<Column<T>[]>(initialColumns)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<{ row: string; col: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [savedViews, setSavedViews] = useState<Record<string, any>>({})
  const [viewName, setViewName] = useState("")
  const [activeView, setActiveView] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [colWidths, setColWidths] = useState<Record<string, number>>({})
  const resizingRef = useRef<{ col: string; startX: number; startW: number } | null>(null)
  const dragRef = useRef<{ col: string; index: number } | null>(null)

  // ─── Column widths ──────────────────────────────────────────────────────
  const getWidth = useCallback((col: Column<T>) => colWidths[col.id] || col.width || 150, [colWidths])

  // ─── Resize ─────────────────────────────────────────────────────────────
  const handleResizeStart = useCallback((col: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    resizingRef.current = { col, startX: e.clientX, startW: getWidth(columns.find(c => c.id === col)!) }
    const handleMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const diff = ev.clientX - resizingRef.current.startX
      const newW = Math.max(60, resizingRef.current.startW + diff)
      setColWidths(p => ({ ...p, [resizingRef.current!.col]: newW }))
    }
    const handleUp = () => { resizingRef.current = null; document.removeEventListener("mousemove", handleMove); document.removeEventListener("mouseup", handleUp) }
    document.addEventListener("mousemove", handleMove); document.addEventListener("mouseup", handleUp)
  }, [columns, getWidth])

  // ─── Reorder ────────────────────────────────────────────────────────────
  const handleDragStart = (col: string, index: number) => { dragRef.current = { col, index } }
  const handleDrop = (targetIndex: number) => {
    if (!dragRef.current) return
    const newCols = [...columns]
    const [moved] = newCols.splice(dragRef.current.index, 1)
    newCols.splice(targetIndex, 0, moved)
    setColumns(newCols)
    dragRef.current = null
  }

  // ─── Pin ────────────────────────────────────────────────────────────────
  const togglePin = (colId: string) => {
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, pinned: c.pinned === "left" ? null : "left" } : c))
  }

  // ─── Sort ───────────────────────────────────────────────────────────────
  const handleSort = (colId: string) => {
    if (sortField === colId) { setSortDir(d => d === "asc" ? "desc" : "asc") }
    else { setSortField(colId); setSortDir("asc") }
  }

  // ─── Filter ─────────────────────────────────────────────────────────────
  const filteredData = data.filter(row => {
    for (const [colId, val] of Object.entries(filters)) {
      if (!val) continue
      const col = columns.find(c => c.id === colId)
      if (!col) continue
      const cellValue = String(col.accessor(row) ?? "").toLowerCase()
      if (!cellValue.includes(val.toLowerCase())) return false
    }
    return true
  })

  // ─── Sort ───────────────────────────────────────────────────────────────
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    const col = columns.find(c => c.id === sortField)
    if (!col) return 0
    const va = col.accessor(a), vb = col.accessor(b)
    if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
    return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })

  // ─── Grouping ───────────────────────────────────────────────────────────
  const groupedData = groupBy ? (() => {
    const col = columns.find(c => c.id === groupBy)
    if (!col) return { groups: [{ key: "All", rows: sortedData }] }
    const groups = new Map<string, T[]>()
    for (const row of sortedData) {
      const key = String(col.accessor(row) ?? "N/A")
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }
    return { groups: Array.from(groups.entries()).map(([key, rows]) => ({ key, rows })) }
  })() : null

  // ─── Aggregation ────────────────────────────────────────────────────────
  const getAggregate = (col: Column<T>, rows: T[]) => {
    if (!col.aggregate) return null
    const values = rows.map(r => col.accessor(r)).filter(v => typeof v === "number") as number[]
    if (values.length === 0) return null
    switch (col.aggregate) {
      case "sum": return values.reduce((a, b) => a + b, 0)
      case "avg": return values.reduce((a, b) => a + b, 0) / values.length
      case "min": return Math.min(...values)
      case "max": return Math.max(...values)
      case "count": return values.length
    }
  }

  // ─── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

  // ─── Selection ──────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => { setSelected(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  const toggleSelectAll = () => { if (selected.size === pagedData.length) setSelected(new Set()); else setSelected(new Set(pagedData.map(getId))) }

  // ─── Inline edit ────────────────────────────────────────────────────────
  const startEdit = (row: T, colId: string) => {
    const col = columns.find(c => c.id === colId)
    if (!col?.editable) return
    setEditing({ row: getId(row), col: colId })
    setEditValue(String(col.accessor(row) ?? ""))
  }
  const commitEdit = (row: T) => {
    if (editing && onCellEdit) onCellEdit(row, editing.col, editValue)
    setEditing(null)
  }

  // ─── Saved Views ────────────────────────────────────────────────────────
  const saveView = () => {
    if (!viewName) return
    setSavedViews(p => ({ ...p, [viewName]: { sortField, sortDir, filters, groupBy, colWidths, pageSize } }))
    setViewName("")
  }
  const loadView = (name: string) => {
    const view = savedViews[name]; if (!view) return
    setSortField(view.sortField); setSortDir(view.sortDir); setFilters(view.filters || {})
    setGroupBy(view.groupBy); setColWidths(view.colWidths || {}); setActiveView(name)
  }

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "a") { e.preventDefault(); toggleSelectAll() }
      if (e.key === "Escape") { setEditing(null) }
      if (e.key === "Enter" && editing) { commitEdit(pagedData.find(r => getId(r) === editing.row)! ) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [editing, pagedData])

  // ─── Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const visibleCols = columns
    const headers = visibleCols.map(c => c.header).join(",")
    const rows = sortedData.map(row => visibleCols.map(c => `"${String(c.accessor(row) ?? "")}"`).join(",")).join("\n")
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `${tableName}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const renderCell = (row: T, col: Column<T>) => {
    const value = col.accessor(row)
    const isEditing = editing?.row === getId(row) && editing?.col === col.id
    if (isEditing) return <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full px-1 py-0.5 rounded text-xs outline-none" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--status-error)", color: "white" }} />
    const formatted = col.format ? col.format(value) : value ?? "—"
    return <span>{formatted}</span>
  }

  const renderRows = (rows: T[]) => rows.map(row => {
    const id = getId(row)
    const pinnedLeft = columns.filter(c => c.pinned === "left")
    const scrollable = columns.filter(c => !c.pinned)
    return (
      <tr key={id} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default" }}>
        <td className="px-2 py-2 text-xs" style={{ borderBottom: "1px solid var(--admin-border)", width: 30 }}>
          <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} onClick={e => e.stopPropagation()} />
        </td>
        {pinnedLeft.map(col => (
          <td key={col.id} className="px-3 py-2 text-xs whitespace-nowrap" style={{ borderBottom: "1px solid var(--admin-border)", width: getWidth(col), minWidth: col.minWidth || 60, position: "sticky", left: 0, backgroundColor: "var(--admin-surface)", zIndex: 1, textAlign: col.align || "left" }}
            onDoubleClick={() => startEdit(row, col.id)}>
            {renderCell(row, col)}
          </td>
        ))}
        {scrollable.map(col => (
          <td key={col.id} className="px-3 py-2 text-xs whitespace-nowrap" style={{ borderBottom: "1px solid var(--admin-border)", width: getWidth(col), minWidth: col.minWidth || 60, textAlign: col.align || "left" }}
            onDoubleClick={() => startEdit(row, col.id)}>
            {renderCell(row, col)}
          </td>
        ))}
      </tr>
    )
  })

  return (
    <div className="space-y-2">
      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button onClick={() => setShowFilters(!showFilters)} className="px-2 py-1 rounded" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: showFilters ? "var(--status-error)" : "rgba(255,255,255,0.5)" }}>🔍 Filters</button>
        <button onClick={exportCSV} className="px-2 py-1 rounded" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "rgba(255,255,255,0.5)" }}>📤 CSV</button>
        <select value={groupBy || ""} onChange={e => setGroupBy(e.target.value || null)} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "white" }}>
          <option value="">Group: None</option>
          {columns.filter(c => !c.pinned).map(c => <option key={c.id} value={c.id}>Group: {c.header}</option>)}
        </select>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{selected.size} selected</span>
        {selected.size > 0 && onBulkAction && (
          <button onClick={() => onBulkAction("delete", Array.from(selected))} className="px-2 py-1 rounded" style={{ backgroundColor: "rgba(239,68,68,0.2)", color: "#EF4444" }}>🗑 Delete</button>
        )}
        </div>

      {/* ─── Filters ─────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap p-2 rounded" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)" }}>
          {columns.filter(c => c.filterable !== false).map(col => (
            <div key={col.id} className="flex items-center gap-1">
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{col.header}</span>
              <input value={filters[col.id] || ""} onChange={e => setFilters(p => ({ ...p, [col.id]: e.target.value }))} placeholder="Filter..." className="px-2 py-1 rounded text-[10px] outline-none" style={{ width: 100, backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "white" }} />
            </div>
          ))}
        </div>
      )}

      {/* ─── Saved Views ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs">
        <input value={viewName} onChange={e => setViewName(e.target.value)} placeholder="View name..." className="px-2 py-1 rounded text-xs outline-none" style={{ width: 120, backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "white" }} />
        <button onClick={saveView} className="px-2 py-1 rounded" style={{ backgroundColor: "rgba(59,130,246,0.2)", color: "#3B82F6" }}>💾 Save View</button>
        {Object.keys(savedViews).map(name => (
          <button key={name} onClick={() => loadView(name)} className="px-2 py-1 rounded text-[10px]" style={{ backgroundColor: activeView === name ? "rgba(239,68,68,0.2)" : "var(--admin-surface)", border: "1px solid var(--admin-border)", color: activeView === name ? "#EF4444" : "rgba(255,255,255,0.5)" }}>{name}</button>
        ))}
      </div>

      {/* ─── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-auto rounded-xl border" style={{ borderColor: "var(--admin-border)", maxHeight: 600 }}>
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "var(--admin-surface)" }}>
              <th className="px-2 py-2 text-[10px] font-medium" style={{ borderBottom: "1px solid var(--admin-border)", width: 30, position: "sticky", left: 0, zIndex: 3, backgroundColor: "var(--admin-surface)" }}>
                <input type="checkbox" checked={selected.size === pagedData.length && pagedData.length > 0} onChange={toggleSelectAll} />
              </th>
              {columns.filter(c => c.pinned === "left").map((col, i) => (
                <th key={col.id} className="px-3 py-2 text-[10px] font-medium whitespace-nowrap" style={{ borderBottom: "1px solid var(--admin-border)", width: getWidth(col), minWidth: col.minWidth || 60, position: "sticky", left: 30, zIndex: 3, backgroundColor: "var(--admin-surface)", cursor: col.sortable ? "pointer" : "default" }}
                  draggable onDragStart={() => handleDragStart(col.id, i)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(i)}>
                  <div className="flex items-center gap-1" onClick={() => col.sortable && handleSort(col.id)}>
                    <span>{col.header}</span>
                    {sortField === col.id && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                    <button onClick={() => togglePin(col.id)} className="text-[8px] opacity-50 hover:opacity-100" title="Unpin">📌</button>
                    <div onMouseDown={e => handleResizeStart(col.id, e)} style={{ width: 4, cursor: "col-resize", position: "absolute", right: 0, top: 0, bottom: 0 }} />
                  </div>
                </th>
              ))}
              {columns.filter(c => !c.pinned).map((col, i) => (
                <th key={col.id} className="px-3 py-2 text-[10px] font-medium whitespace-nowrap" style={{ borderBottom: "1px solid var(--admin-border)", width: getWidth(col), minWidth: col.minWidth || 60, cursor: col.sortable ? "pointer" : "default" }}
                  draggable onDragStart={() => handleDragStart(col.id, columns.filter(c => c.pinned === "left").length + i)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(columns.filter(c => c.pinned === "left").length + i)}>
                  <div className="flex items-center gap-1" onClick={() => col.sortable && handleSort(col.id)}>
                    <span>{col.header}</span>
                    {sortField === col.id && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                    {col.pinned !== "left" && <button onClick={() => togglePin(col.id)} className="text-[8px] opacity-50 hover:opacity-100" title="Pin left">📌</button>}
                    <div onMouseDown={e => handleResizeStart(col.id, e)} style={{ width: 4, cursor: "col-resize", position: "absolute", right: 0, top: 0, bottom: 0 }} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedData ? groupedData.groups.map(g => (
              <>
                <tr><td colSpan={columns.length + 1} className="px-3 py-1.5 text-[10px] font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--admin-border)", color: "rgba(255,255,255,0.5)" }}>{g.key} ({g.rows.length})</td></tr>
                {renderRows(g.rows)}
              </>
            )) : renderRows(pagedData)}
          </tbody>
          {/* ─── Aggregation footer ──────────────────────────────────────── */}
          {columns.some(c => c.aggregate) && (
            <tfoot>
              <tr style={{ position: "sticky", bottom: 0, zIndex: 2, backgroundColor: "rgba(255,255,255,0.03)" }}>
                <td className="px-2 py-1.5 text-[10px] font-semibold" style={{ borderTop: "1px solid var(--admin-border)", color: "rgba(255,255,255,0.4)" }} />
                {columns.filter(c => c.pinned === "left").map(col => (
                  <td key={col.id} className="px-3 py-1.5 text-[10px] font-semibold" style={{ borderTop: "1px solid var(--admin-border)", color: "var(--status-error)", position: "sticky", left: 30, backgroundColor: "rgba(255,255,255,0.03)" }}>
                    {col.aggregate ? `${col.aggregate}: ${getAggregate(col, sortedData) ?? "—"}` : ""}
                  </td>
                ))}
                {columns.filter(c => !c.pinned).map(col => (
                  <td key={col.id} className="px-3 py-1.5 text-[10px] font-semibold" style={{ borderTop: "1px solid var(--admin-border)", color: "var(--status-error)" }}>
                    {col.aggregate ? `${col.aggregate}: ${getAggregate(col, sortedData) ?? "—"}` : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ─── Pagination — Dynamic Island ──────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "rgba(255,255,255,0.3)" }}>{sortedData.length} rows</span>
        <PageSelector currentPage={page} totalPages={totalPages || 1} onPageChange={setPage} />
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Ctrl+A select all | ↩ edit | Esc cancel</span>
      </div>
    </div>
  )
}
