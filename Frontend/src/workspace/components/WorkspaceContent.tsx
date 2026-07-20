"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { useAppRegistry } from "@/app-framework/registry/application-registry"
import { SmartSearch } from "@/components/effects/SmartSearch"
import { Pagination } from "@/components/ui/pagination"
import { useTranslation } from "@/hooks/use-translation"
import { WorkspaceHome } from "./WorkspaceHome"
import { futuristic, transitions } from "@/design-system/motion"

const entityColumns: Record<string, { id: string; label: string; sortable?: boolean }[]> = {
  customers: [
    { id: "name", label: "Name", sortable: true },
    { id: "email", label: "Email", sortable: true },
    { id: "phone", label: "Phone" },
    { id: "status", label: "Status", sortable: true },
  ],
  meters: [
    { id: "serial", label: "Serial", sortable: true },
    { id: "type", label: "Type", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "location", label: "Location" },
  ],
  invoices: [
    { id: "number", label: "Number", sortable: true },
    { id: "amount", label: "Amount", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "date", label: "Date", sortable: true },
  ],
  readings: [
    { id: "meter", label: "Meter", sortable: true },
    { id: "value", label: "Value", sortable: true },
    { id: "date", label: "Date", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ],
  payments: [
    { id: "method", label: "Method", sortable: true },
    { id: "amount", label: "Amount", sortable: true },
    { id: "date", label: "Date", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ],
}

const entityIcons: Record<string, string> = {
  customers: "customers", meters: "meters", invoices: "invoices",
  readings: "readings", payments: "payments",
}

function AppPage({ appId, title, description }: { appId: string; title: string; description?: string }) {
  const [notif, setNotif] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortOpen, setSortOpen] = useState(false)
  const { viewMode, setViewMode } = useWorkspaceStore()
  const { t } = useTranslation()
  const columns = entityColumns[appId] || [
    { id: "name", label: "Name", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ]
  const showAdd = [
    "customers", "customer-groups", "contacts", "contracts",
    "meters", "meter-types",
    "invoices", "invoice-generator", "credit-notes",
    "readings", "manual-reading", "bulk-import",
    "payments",
    "operations", "work-orders",
    "financial", "revenue", "cash-flow",
    "reports", "financial-reports", "consumption-reports",
    "monitoring", "alerts",
    "iot",
    "admin", "users", "roles", "audit-logs",
    "security", "authentication", "api-tokens",
    "ai-center", "ai-assistant", "ai-insights",
    "settings", "system-config", "backups",
    "developer", "api-explorer", "runtime-inspector", "logs",
  ].includes(appId)
  const icon = entityIcons[appId] || "dashboard"
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    const resourceMap: Record<string, string> = { customers: "customers", meters: "meters", readings: "readings", invoices: "invoices", payments: "payments" }
    const resource = resourceMap[appId]
    if (!resource) return
    setLoading(true)
    fetch(`/api/meterverse/${resource}`)
      .then(r => r.ok ? r.json() : Promise.reject("API unavailable"))
      .then(json => { setData(json[resource] || []); setLoading(false) })
      .catch(() => { setData(null); setLoading(false); setDataError(null) })
  }, [appId])

  const rows = data || Array.from({ length: 15 }, (_, i) => i + 1)

  const handleAdd = useCallback(() => {
    setNotif(`New ${title} dialog would open here`)
    setTimeout(() => setNotif(null), 3000)
  }, [title])

  const toggleSort = useCallback((field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("asc") }
  }, [sortField])

  const clearSearch = useCallback(() => setSearchQuery(""), [])

  const sampleFilters = useMemo(() => {
    if (!searchQuery) return []
    return [{ id: "search", label: `Search: "${searchQuery}"` }]
  }, [searchQuery])

  const allFilters = [...sampleFilters, ...activeFilters.map((f) => ({ id: f, label: f }))]

  return (
    <motion.div
      initial={futuristic.pageEntrance.initial}
      animate={futuristic.pageEntrance.animate}
      exit={{ opacity: 0, y: -20, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.2 } }}
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--surface-base)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon === "customers" ? "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" :
                  icon === "meters" ? "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" :
                  icon === "invoices" ? "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" :
                  icon === "readings" ? "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" :
                  icon === "payments" ? "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" :
                  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h1>
            {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{description}</p>}
          </div>
        </div>
        {showAdd && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(var(--brand-rgb), 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            aria-label={t("content.addNew", "Add new") + " " + title}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg overflow-hidden"
            style={{ backgroundColor: "var(--sidebar-background)", color: "var(--sidebar-text)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            {/* Pulsing ring */}
            <motion.span className="absolute inset-0 rounded-xl" style={{ boxShadow: "0 0 0 0 rgba(var(--brand-rgb), 0.1)" }}
              animate={{ boxShadow: ["0 0 0 0 rgba(var(--brand-rgb), 0.1)", "0 0 0 8px rgba(var(--brand-rgb), 0)", "0 0 0 0 rgba(var(--brand-rgb), 0)"] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            {/* Shine effect */}
            <motion.span className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(135deg, transparent 30%, rgba(var(--white-rgb), 0.2) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="relative"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="relative">{t("content.addNew", "Add new")} {title}</span>
          </motion.button>
        )}
      </div>

      {/* Search + Sort — Glass-morphism */}
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <SmartSearch
          placeholder={t("content.search", "Search") + " " + title.toLowerCase() + "..."}
          onSearch={(q) => setSearchQuery(q)}
          suggestions={[]}
        />
        {/* View Mode Toggle — premium 3D effect */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: viewMode === "list" ? -5 : 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          aria-label={viewMode === "list" ? "Grid view" : "List view"}
          className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 relative"
          style={{
            color: "var(--brand)",
            background: "var(--surface-raised)",
            boxShadow: "0 2px 8px rgba(var(--black-rgb), 0.06), 0 0 0 1px rgba(var(--brand-rgb), 0.1)",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ background: "linear-gradient(135deg, rgba(var(--brand-rgb), 0.1), transparent)", pointerEvents: "none" }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {viewMode === "list" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative" style={{ filter: "drop-shadow(0 1px 2px rgba(var(--brand-rgb), 0.1))" }}>
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative" style={{ filter: "drop-shadow(0 1px 2px rgba(var(--brand-rgb), 0.1))" }}>
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          )}
        </motion.button>
        {columns.filter(c => c.sortable).length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("content.sort", "Sort:")}</span>
            <div className="relative dropdown-modern">
              <motion.button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs outline-none transition-all bg-transparent cursor-pointer min-w-[80px]"
                style={{ borderColor: sortField ? "var(--brand)" : "var(--border-default)", color: "var(--text-primary)" }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex-1 text-left">{sortField ? columns.find((c) => c.id === sortField)?.label : t("content.none", "None")}</span>
                <motion.svg animate={{ rotate: sortOpen ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></motion.svg>
              </motion.button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-1 min-w-[120px] rounded-xl z-50 overflow-hidden"
                    style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }}
                    onClick={() => setSortOpen(false)}
                  >
                    <button onClick={() => { setSortField(""); toggleSort("") }} className="w-full px-3 py-2 text-xs text-left transition-colors hover:bg-black/5 flex items-center gap-2"
                      style={{ color: !sortField ? "var(--brand)" : "var(--text-primary)", backgroundColor: !sortField ? "rgba(var(--brand-rgb), 0.1)" : "transparent" }}>
                      <span>{t("content.none", "None")}</span>
                    </button>
                    {columns.filter(c => c.sortable).map((c) => (
                      <button key={c.id} onClick={() => { setSortField(c.id); toggleSort(c.id) }}
                        className="w-full px-3 py-2 text-xs text-left transition-colors hover:bg-black/5 flex items-center gap-2"
                        style={{ color: sortField === c.id ? "var(--brand)" : "var(--text-primary)", backgroundColor: sortField === c.id ? "rgba(var(--brand-rgb), 0.1)" : "transparent" }}>
                        <span>{c.label}</span>
                        {sortField === c.id && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {sortField && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                aria-label={t("content.sortBy", "Sort by") + " " + (sortDir === "asc" ? t("content.descending", "descending") : t("content.ascending", "ascending"))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: "var(--brand)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d={sortDir === "asc" ? "M12 5v14M8 9l4-4 4 4" : "M12 5v14M8 15l4 4 4-4"} />
                </svg>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {allFilters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.fast}
            className="flex items-center gap-2 px-6 py-2 border-b overflow-hidden"
            style={{ borderColor: "var(--border-default)", backgroundColor: "rgba(var(--brand-rgb), 0.1)" }}
          >
            {allFilters.map((f) => (
              <motion.span
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)", color: "var(--brand)" }}
              >
                {f.label}
                <button onClick={() => {
                  if (f.id === "search") setSearchQuery("")
                  else setActiveFilters((prev) => prev.filter((a) => a !== f.id))
                }} aria-label={`Remove filter ${f.label}`} className="hover:opacity-70">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </motion.span>
            ))}
            {allFilters.length > 1 && (
              <button
                onClick={() => { setSearchQuery(""); setActiveFilters([]) }}
                className="text-xs ml-1 hover:underline"
                style={{ color: "var(--text-tertiary)" }}
              >
                {t("content.clearAll", "Clear all")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Charts — 3 selectable metrics */}
      <div className="shrink-0 px-6 py-3 border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-sunken)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Analysis</span>
          <div className="flex gap-2">
            <select className="px-2 py-1 rounded text-[10px] border outline-none bg-transparent" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              value={sortField || "revenue"} onChange={(e) => setSortField(e.target.value)}>
              <option value="revenue">Revenue</option>
              <option value="meters">Meters</option>
              <option value="customers">Customers</option>
              <option value="readings">Readings</option>
              <option value="payments">Payments</option>
            </select>
            <select className="px-2 py-1 rounded text-[10px] border outline-none bg-transparent" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              value={sortDir} onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}>
              <option value="asc">vs Last Month</option>
              <option value="desc">vs Last Year</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Revenue Trend", value: "+12.4%", sub: "vs last month", color: "var(--status-success)", bars: [40,55,45,70,60,75,85] },
            { label: "Meter Growth", value: "+5.2%", sub: "new installations", color: "var(--brand)", bars: [30,45,55,50,65,70,80] },
            { label: "Collection Rate", value: "94.2%", sub: "vs target 95%", color: "var(--status-warning)", bars: [80,82,88,85,90,92,94] },
          ].map((chart) => (
            <div key={chart.label} className="p-3 rounded-lg" style={{ backgroundColor: "var(--surface-raised)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>{chart.label}</span>
                <span className="text-xs font-semibold" style={{ color: chart.color }}>{chart.value}</span>
              </div>
              <div className="flex items-end gap-1 h-10 mb-1">
                {chart.bars.map((b, i) => (
                  <motion.div key={i} className="flex-1 rounded-t-sm" style={{ backgroundColor: chart.color, opacity: 0.3 + (b/100) * 0.7 }}
                    initial={{ height: 0 }} animate={{ height: `${b}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} />
                ))}
              </div>
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{chart.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content — Grid or List View */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "grid" ? (
          <motion.div
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-3 gap-3"
          >
            {rows.map((item: any, i: number) => {
              const id = typeof item === "number" ? item : item.id || (i + 1)
              const statuses = ["success","warning","error","info","default"] as const
              const status = statuses[i % statuses.length]
              const statusColors = {success:"var(--status-success)",warning:"var(--status-warning)",error:"var(--status-error)",info:"#3B82F6",default:"var(--brand)"}
              const sc = statusColors[status]
              return (
              <motion.div
                key={i}
                variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
                whileHover={{ y: -3, boxShadow: `0 12px 40px ${sc}20, 0 0 0 1px ${sc}30` }}
                className="rounded-xl p-5 relative overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "var(--shadow-sm)",
                    minHeight: 200,
                  }}
              >
                {/* Premium 3D shine overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(var(--white-rgb), 0.15) 0%, transparent 50%, rgba(var(--white-rgb), 0.05) 100%)" }} />
                {/* Heart-rate pulse line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                  <motion.div
                    className="h-full w-full"
                    style={{ backgroundColor: sc }}
                    animate={{ x: ["-100%", "100%"], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                  />
                </div>
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg" style={{ backgroundColor: sc, boxShadow: `0 4px 12px ${sc}30` }}>
                      {title[0]}
                    </span>
                    <div>
                      <span className="text-sm font-semibold truncate block" style={{ color: "var(--text-primary)" }}>
                        {title} #{i}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>ID: {title?.toLowerCase()}-{1000 + i}</span>
                    </div>
                  </div>
                  <motion.span
                    className="text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap shadow-sm"
                    style={{ backgroundColor: `${sc}15`, color: sc }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ● {status}
                  </motion.span>
                </div>
                {/* Card body — 2-column detail grid with more info */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                  {columns.slice(0, 4).map((col) => (
                    <div key={col.id} className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{col.label}</span>
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>—</span>
                    </div>
                  ))}
                </div>
                {/* Card footer — meta info */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border-default)" }}>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Updated {i} min ago</span>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); const el = document.getElementById(`menu-${i}`); if (el) el.classList.toggle("hidden") }} aria-label="Options" className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-tertiary)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                    <div id={`menu-${i}`} className="hidden absolute right-0 bottom-full mb-1 w-36 rounded-xl z-50 overflow-hidden" role="menu" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }} onClick={(e) => e.stopPropagation()}>
                      {[{ icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z", label: "View" }, { icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", label: "Edit" }, { icon: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2", label: "Delete" }].map((opt) => (
                        <button key={opt.label} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10" aria-label="Menu option" style={{ color: opt.label === "Delete" ? "var(--status-error)" : "var(--text-primary)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={opt.icon} /></svg>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.div>
        ) : (
          <motion.div layout transition={transitions.smooth} className="rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--surface-tableHeader)" }}>
                  {columns.map((col) => (
                    <th key={col.id} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <button onClick={() => toggleSort(col.id)} aria-label={`Sort by ${col.label}`} className="hover:opacity-70">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={sortField === col.id ? "var(--brand)" : "currentColor"} strokeWidth="2"><path d="M8 6l4-4 4 4M8 18l4 4 4-4"/></svg>
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{t("content.status", "Status")}</th>
                  <th className="px-2 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((item: any, i: number) => {
                  const statuses = ["Active","Active","Warning","Active","Error","Active","Active","Warning","Active","Active","Error","Active","Warning","Active","Active"]
                  const status = statuses[i % statuses.length]
                  const statusColor = status === "Error" ? "var(--status-error)" : status === "Warning" ? "var(--status-warning)" : "var(--brand)"
                  return (
                  <motion.tr key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative"
                    style={{ borderBottom: "1px solid var(--border-default)" }}
                  >
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                        <span className="flex items-center gap-2">
                          {col.id === columns[0].id && (
                            <motion.span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: statusColor }}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                            />
                          )}
                          {col.sortable ? `${title} #${i}` : "—"}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                        <motion.span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor }}
                          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        {status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-xs relative">
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); const el = document.getElementById(`rm-${i}`); if (el) el.classList.toggle("hidden") }} aria-label="Options" className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-tertiary)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                        <div id={`rm-${i}`} className="hidden absolute right-0 bottom-full mb-1 w-36 rounded-xl z-50 overflow-hidden" role="menu" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }}>
                          {[{ icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z", label: "View" }, { icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", label: "Edit" }, { icon: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2", label: "Delete", danger: true }].map((opt) => (
                            <button key={opt.label} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:bg-black/5" style={{ color: opt.danger ? "var(--status-error)" : "var(--text-primary)" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={opt.icon} /></svg>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )})}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 px-6 py-3" style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}>
        <Pagination current={1} total={5} onChange={(p) => setNotif(`Go to page ${p}`)} />
      </div>

      {notif && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-xs text-white z-50 animate-in slide-in-from-right"
          style={{ backgroundColor: "var(--sidebar-background)" }}>
          {notif}
        </div>
      )}
    </motion.div>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={futuristic.pageEntrance.initial}
      animate={futuristic.pageEntrance.animate}
      exit={{ opacity: 0, y: -20, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.2 } }}
      className="h-full overflow-y-auto p-6"
      style={{ maxWidth: 960, margin: "0 auto" }}
    >
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{t("home.dashboard", "Dashboard")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{t("home.executiveOverview", "Executive overview")}</p>
      </div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: "Total Meters", value: "—" },
          { label: "Active Customers", value: "—" },
          { label: "Revenue (MTD)", value: "—" },
          { label: "Collection Rate", value: "—" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={{
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22, delay: i * 0.04 } },
            }}
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{stat.label}</div>
            <div className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export function WorkspaceContent() {
  const { tabs, activeTabId } = useWorkspaceStore()
  const { get } = useAppRegistry()

  if (!activeTabId) return <WorkspaceHome />

  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (activeTabId === "welcome") return <WorkspaceHome />
  if (activeTabId === "dashboard") {
    return (
      <AnimatePresence mode="wait">
        <DashboardPage key="dashboard" />
      </AnimatePresence>
    )
  }

  const app = get(activeTabId)
  if (app) {
    return (
      <AnimatePresence mode="wait">
        <AppPage key={activeTabId} appId={activeTabId} title={app.title} description={app.description} />
      </AnimatePresence>
    )
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {activeTab?.label || "Unknown Page"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
          {"Content not yet available"}
        </p>
      </div>
    </div>
  )
}



