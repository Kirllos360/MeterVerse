"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertModal } from "@/components/modal/alert-modal"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import type { PageConfig, EntityAction, ColumnConfig } from "./page-config"

interface GenericAdminPageProps {
  config: PageConfig
  initialData?: any[]
  renderCustom?: (data: any[], filtered: any[], setData: (d: any[]) => void) => React.ReactNode
}

const ROWS_PER_PAGE = 25

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t) }, [value, delay])
  return debounced
}

export function GenericAdminPage({ config, initialData, renderCustom }: GenericAdminPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({})
  const debouncedSearch = useDebounce(search, 300)

  const queryKey = config.apiEndpoint ? [config.id, "list"] : []
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(config.apiEndpoint, { headers: { "X-Dev-Mode": "true" } })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const d = await res.json()
      return config.transform ? config.transform(d) : Array.isArray(d) ? d : d[Object.keys(d).find(k => Array.isArray(d[k])) || "items"] || []
    },
    enabled: !!config.apiEndpoint && !initialData,
    staleTime: 30000,
    retry: 2,
  })

  const data = initialData || rawData || []

  const filtered = useMemo(() => {
    let result = data
    if (tab !== "all") {
      const tabDef = config.tabs?.find(t => t.value === tab) || defaultTabsWithStatus.find(t => t.value === tab)
      if (tabDef?.filter) result = result.filter(tabDef.filter)
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((r: any) => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
    }
    return result
  }, [data, tab, debouncedSearch, config.tabs])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paged = useMemo(() => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE), [filtered, page])
  useEffect(() => { setPage(1) }, [tab, debouncedSearch])

  const handleAction = (action: EntityAction, row?: any) => {
    switch (action) {
      case "view": window.open(`/${config.id}/${row.id}`, "_self"); break
      case "add": setEditTarget(null); setSheetOpen(true); break
      case "edit": setEditTarget(row); setSheetOpen(true); break
      case "delete": setDeleteTarget(row); setDeleteOpen(true); break
      case "activate": updateStatus(row, "active"); break
      case "deactivate": updateStatus(row, "inactive"); break
      case "maintain": updateStatus(row, "maintenance"); break
      case "terminate": updateStatus(row, "terminated"); break
    }
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [config.id] })

  const handleSubmit = async () => {
    setSubmitting(true)
    const isEdit = !!editTarget
    const method = isEdit ? "PUT" : "POST"
    const url = isEdit ? `${config.apiEndpoint}/${editTarget.id || editTarget[config.rowKey || "id"]}` : config.apiEndpoint
    const formData: Record<string, string> = {}
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("#entity-sheet-form input, #entity-sheet-form select, #entity-sheet-form textarea")
    inputs.forEach(inp => { if (inp.name) formData[inp.name] = inp.value })
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify(formData) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || `HTTP ${res.status}`) }
      toast.success(isEdit ? "Updated successfully" : "Created successfully")
      setSubmitting(false); setSheetOpen(false); setEditTarget(null); invalidate()
    } catch (e: any) { setSubmitting(false); toast.error(e.message) }
  }

  const updateStatus = async (row: any, status: string) => {
    const id = row.id || row[config.rowKey || "id"]
    setStatusUpdating(p => ({ ...p, [id]: true }))
    try {
      await fetch(`${config.apiEndpoint || ""}/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ status }),
      })
      toast.success(`Status changed to ${status}`)
      invalidate()
    } catch { toast.error("Failed to update status") }
    setStatusUpdating(p => ({ ...p, [id]: false }))
  }

  const deleteRecord = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id || deleteTarget[config.rowKey || "id"]
    try {
      const res = await fetch(`${config.apiEndpoint || ""}/${id}`, { method: "DELETE", headers: { "X-Dev-Mode": "true" } })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || `HTTP ${res.status}`) }
      toast.success("Deleted successfully")
      invalidate()
    } catch (e: any) { setSubmitting(false); toast.error(e.message) }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  const renderCell = (row: any, col: ColumnConfig) => {
    const val = col.accessor(row)
    switch (col.type) {
      case "badge":
        return <Badge variant={col.badgeVariant?.(val) || "default"} className="capitalize">{val}</Badge>
      case "status": {
        const v = val || "active"
        const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          active: "default", inactive: "secondary", maintenance: "outline", terminated: "destructive",
        }
        return <Badge variant={map[v] || "outline"} className="capitalize">{v}</Badge>
      }
      case "avatar":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary shrink-0">
              {String(val).charAt(0).toUpperCase()}
            </div>
            <span className="font-medium truncate max-w-[160px]">{val}</span>
          </div>
        )
      case "email":
        return <span className="text-muted-foreground text-sm truncate max-w-[200px] block">{val}</span>
      case "date":
        return <span className="text-xs text-muted-foreground">{val?.substring?.(0,10) || val || "—"}</span>
      case "number":
        return <span className="tabular-nums font-medium">{typeof val === "number" ? val.toLocaleString() : val}</span>
      default:
        return <span className="truncate max-w-[200px] block">{val ?? "—"}</span>
    }
  }

  // ─── Error State ───
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold tracking-tight">{config.title}</h1><p className="text-sm text-muted-foreground mt-1">{config.description}</p></div></div>
        <Card><CardContent className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"><Icons.circleX className="h-6 w-6 text-destructive" /></div>
          <p className="text-sm text-muted-foreground">Failed to load data: {error instanceof Error ? error.message : "Unknown error"}</p>
          <Button onClick={() => refetch()}><Icons.arrowRight className="mr-2 h-4 w-4" />Retry</Button>
        </CardContent></Card>
      </div>
    )
  }

  // ─── Loading State ───
  if (isLoading) {
    const sk = (w: string) => <div className={`bg-muted rounded ${w}`} />
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between"><div>{sk("h-8 w-48")}<div className="mt-1">{sk("h-4 w-64")}</div></div></div>
        {config.statsCards && <div className="grid grid-cols-4 gap-4">{config.statsCards.map((_,i) => <div key={i} className="bg-muted h-24 rounded-xl" />)}</div>}
        <div className="flex items-center justify-between">{sk("h-10 w-96")}{sk("h-10 w-64")}</div>
        <Card>{sk("h-80 w-full")}</Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{config.description} — {data.length} records</p>
        </div>
        <div className="flex items-center gap-3">
          {config.fields.length > 0 && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => handleAction("add")}><Icons.add className="mr-2 h-4 w-4" />Add {config.title.split(" ").pop() || "Item"}</Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══ KPI BAR ═══ */}
      {data.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {data.length} records</span>
          <span>cache: 30s</span>
          <button onClick={() => refetch()} className="text-primary hover:underline"><Icons.arrowRight className="h-3 w-3 inline mr-0.5" />refresh</button>
        </motion.div>
      )}

      {/* ═══ STATS CARDS ═══ */}
      {config.statsCards && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-4">
          {config.statsCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 20 }}>
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div key={s.value(data)} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-2xl font-bold">{s.value(data)}</motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ═══ TABS + SEARCH ═══ */}
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {(config.tabs || defaultTabsWithStatus).map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                {t.value !== "all" && <span className="ml-1.5 text-[10px] opacity-60">({data.filter(t.filter || (()=>true)).length})</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-64">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ═══ ADD/EDIT SHEET ═══ */}
      <Sheet open={sheetOpen} onOpenChange={o => { setSheetOpen(o); if (!o) setEditTarget(null) }}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editTarget ? `Edit ${config.title.split(" ").pop()}` : `New ${config.title.split(" ").pop()}`}</SheetTitle>
            <SheetDescription>{editTarget ? "Update the details below. All fields marked with * are required." : "Fill in the details to create a new entry. All fields marked with * are required."}</SheetDescription>
          </SheetHeader>
          <div id="entity-sheet-form" className="flex-1 overflow-auto space-y-4 py-4">
            {config.fields.map(f => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <label className="text-sm font-medium">{f.label}{f.required && <span className="text-destructive ml-1">*</span>}</label>
                {f.type === "select" ? (
                  <select name={f.name} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" defaultValue={editTarget?.[f.name] || ""}>
                    <option value="">{f.placeholder || `Select ${f.label}`}</option>
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea name={f.name} className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder={f.placeholder} defaultValue={editTarget?.[f.name] || ""} />
                ) : (
                  <Input name={f.name} type={f.type} placeholder={f.placeholder} defaultValue={editTarget?.[f.name] || ""} />
                )}
              </motion.div>
            ))}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => { setSheetOpen(false); setEditTarget(null) }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}><Icons.check className="mr-2 h-4 w-4" />{editTarget ? "Update" : "Save"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ DELETE MODAL ═══ */}
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={deleteRecord}
        loading={false}
      />

      {/* ═══ CONTENT ═══ */}
      {renderCustom ? renderCustom(data, filtered, () => invalidate()) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {config.columns.map(col => (
                      <TableHead key={col.id} style={col.width ? { width: col.width } : undefined}>{col.header}</TableHead>
                    ))}
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                  {paged.length === 0 ? (
                    <TableRow key="empty">
                      <TableCell colSpan={config.columns.length + 1} className="h-24 text-center text-muted-foreground">
                        {search ? "No records match your search." : "No records found."}
                      </TableCell>
                    </TableRow>
                  ) : paged.map((row: any, idx: number) => {
                    const rid = row.id || row[config.rowKey || "id"] || `row-${idx}`
                    return (
                      <motion.tr key={rid}
                        onClick={() => {
                          const entityPath = config.resource || (config.title ? config.title.toLowerCase() : "");
                          const id = row.id || row[config.rowKey || "id"];
                          if (entityPath && id) {
                            router.push("/admin/" + entityPath + "/" + id);
                          }
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      >
                        {config.columns.map(col => (
                          <TableCell key={col.id}>{renderCell(row, col as ColumnConfig)}</TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                              <span className="sr-only">Open menu</span>
                              <Icons.ellipsis className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleAction("view", row)}><Icons.eyeOff className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("edit", row)}><Icons.edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("activate", row)} disabled={row.status === "active"}>
                                <Icons.circleCheck className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("deactivate", row)} disabled={row.status === "inactive"}>
                                <Icons.circleX className="mr-2 h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("maintain", row)} disabled={row.status === "maintenance"}>
                                <Icons.settings className="mr-2 h-4 w-4" /> Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("terminate", row)} disabled={row.status === "terminated"}>
                                <Icons.trash className="mr-2 h-4 w-4" /> Terminate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("delete", row)} className="text-destructive">
                                <Icons.trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* ═══ PAGINATION ═══ */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
                <span>{filtered.length} records · page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><Icons.chevronLeft className="h-4 w-4" /></Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                    const p = start + i
                    return p <= totalPages ? (
                      <Button key={p} variant={p === page ? "default" : "ghost"} size="sm" className="w-8 h-8 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
                    ) : null
                  })}
                  <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><Icons.chevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

const defaultTabsWithStatus = [
  { value: "all", label: "All", filter: () => true },
  { value: "active", label: "Active", filter: (r: any) => r.status === "active" },
  { value: "inactive", label: "Inactive", filter: (r: any) => r.status === "inactive" },
  { value: "maintenance", label: "Maintenance", filter: (r: any) => r.status === "maintenance" },
  { value: "terminated", label: "Terminated", filter: (r: any) => r.status === "terminated" },
]



