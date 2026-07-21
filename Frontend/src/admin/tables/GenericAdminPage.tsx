"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { motion } from "framer-motion"
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
import type { PageConfig, EntityAction, ColumnConfig } from "./page-config"

interface GenericAdminPageProps {
  config: PageConfig
  initialData?: any[]
  renderCustom?: (data: any[], filtered: any[], setData: (d: any[]) => void) => React.ReactNode
}

export function GenericAdminPage({ config, initialData, renderCustom }: GenericAdminPageProps) {
  const [data, setData] = useState<any[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  useEffect(() => {
    if (initialData || !config.apiEndpoint) { setLoading(false); return }
    setLoading(true)
    fetch(config.apiEndpoint)
      .then(r => r.json())
      .then(d => {
        const items = config.transform ? config.transform(d) : Array.isArray(d) ? d : d[Object.keys(d).find(k => Array.isArray(d[k])) || "items"] || []
        setData(items)
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [config.apiEndpoint])

  const filtered = data.filter(r => {
    if (tab !== "all") {
      const tabDef = config.tabs?.find(t => t.value === tab) || defaultTabsWithStatus.find(t => t.value === tab)
      if (tabDef?.filter && !tabDef.filter(r)) return false
    }
    if (search) {
      const match = Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
      if (!match) return false
    }
    return true
  })

  const handleAction = (action: EntityAction, row?: any) => {
    switch (action) {
      case "view": break
      case "add": setEditTarget(null); setSheetOpen(true); break
      case "edit": setEditTarget(row); setSheetOpen(true); break
      case "delete": setDeleteTarget(row); setDeleteOpen(true); break
      case "activate": updateStatus(row, "active"); break
      case "deactivate": updateStatus(row, "inactive"); break
      case "maintain": updateStatus(row, "maintenance"); break
      case "terminate": updateStatus(row, "terminated"); break
    }
  }

  const updateStatus = async (row: any, status: string) => {
    setData(p => p.map(r => r.id === row.id ? { ...r, status } : r))
    try {
      const key = row.id ? "id" : Object.keys(row).find(k => row[k] === row.id) || "id"
      await fetch(`${config.apiEndpoint}/${row.id || row[key]}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch {}
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
            <span className="font-medium">{val}</span>
          </div>
        )
      case "email":
        return <span className="text-muted-foreground">{val}</span>
      case "date":
        return <span className="text-xs text-muted-foreground">{val?.substring?.(0,10) || val || "—"}</span>
      case "number":
        return <span className="tabular-nums font-medium">{val?.toLocaleString?.() || val}</span>
      default:
        return <span>{val || "—"}</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-muted h-8 w-48 rounded" />
        {config.statsCards && <div className="grid grid-cols-4 gap-4">{config.statsCards.map((_,i) => <div key={i} className="bg-muted h-24 rounded-xl" />)}</div>}
        <div className="bg-muted h-10 w-full rounded" />
        <div className="bg-muted h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>
        <Button onClick={() => handleAction("add")}><Icons.add className="mr-2 h-4 w-4" />Add {config.title.split(" ").pop() || "Item"}</Button>
      </div>

      {/* Stats Cards */}
      {config.statsCards && (
        <div className="grid grid-cols-4 gap-4">
          {config.statsCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value(data)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {(config.tabs || defaultTabsWithStatus).map(t => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-64">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={o => { setSheetOpen(o); if (!o) setEditTarget(null) }}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editTarget ? `Edit ${config.title.split(" ").pop()}` : `New ${config.title.split(" ").pop()}`}</SheetTitle>
            <SheetDescription>{editTarget ? "Update the details below." : "Fill in the details to create a new entry."}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto space-y-4 py-4">
            {config.fields.map(f => (
              <div key={f.name} className="space-y-2">
                <label className="text-sm font-medium">{f.label}{f.required && <span className="text-destructive ml-1">*</span>}</label>
                {f.type === "select" ? (
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" defaultValue={editTarget?.[f.name] || ""}>
                    <option value="">{f.placeholder || `Select ${f.label}`}</option>
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder={f.placeholder} defaultValue={editTarget?.[f.name] || ""} />
                ) : (
                  <Input type={f.type} placeholder={f.placeholder} defaultValue={editTarget?.[f.name] || ""} />
                )}
              </div>
            ))}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => { setSheetOpen(false); setEditTarget(null) }}>Cancel</Button>
            <Button><Icons.check className="mr-2 h-4 w-4" />{editTarget ? "Update" : "Save"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      <AlertModal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={() => { setData(p => p.filter(r => r.id !== deleteTarget?.id)); setDeleteOpen(false); setDeleteTarget(null) }}
        loading={false} />

      {/* Content: custom render or table */}
      {renderCustom ? renderCustom(data, filtered, setData) : (
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={config.columns.length + 1} className="h-24 text-center text-muted-foreground">No records found.</TableCell>
                  </TableRow>
                ) : filtered.map((row) => (
                  <TableRow key={row.id || row[config.rowKey || "id"]} className="hover:bg-muted/50 transition-colors">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
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
