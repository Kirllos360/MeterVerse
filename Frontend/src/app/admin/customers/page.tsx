"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertModal } from "@/components/modal/alert-modal"
import { Icons } from "@/components/icons"

interface Customer {
  id: string; name: string; email: string; phone: string; status: string; area: string; createdAt: string
}

const statusBadge = (s: string) => {
  const v = s === "active" ? "default" : s === "inactive" ? "secondary" : "outline"
  return <Badge variant={v} className="capitalize">{s}</Badge>
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => {
        setData((d.users || []).map((u: any) => ({
          id: u.id, name: u.name, email: u.email, phone: u.phone || "",
          status: u.status || "active", area: u.area || "",
          createdAt: u.createdAt || "",
        })))
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  const filtered = data.filter(c => {
    if (tab !== "all" && c.status !== tab) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = [
    { label: "Total Customers", value: data.length, icon: Icons.teams, color: "var(--primary)" },
    { label: "Active", value: data.filter(c => c.status === "active").length, icon: Icons.circleCheck, color: "var(--status-success, #059669)" },
    { label: "Inactive", value: data.filter(c => c.status === "inactive").length, icon: Icons.circleX, color: "var(--status-warning, #D97706)" },
    { label: "This Month", value: data.filter(c => c.createdAt?.startsWith(new Date().toISOString().substring(0,7))).length, icon: Icons.calendar, color: "var(--status-info, #3B82F6)" },
  ]

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="bg-muted h-8 w-48 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-muted h-24 rounded-xl" />)}
        </div>
        <div className="bg-muted h-10 w-full rounded" />
        <div className="bg-muted h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer base — {data.length} total records</p>
        </div>
        <Sheet open={editOpen && !selected} onOpenChange={o => { setEditOpen(o); if (!o) setSelected(null) }}>
          <Button onClick={() => setEditOpen(true)}><Icons.add className="mr-2 h-4 w-4" />Add Customer</Button>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>New Customer</SheetTitle>
              <SheetDescription>Fill in the details to register a new customer.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-auto space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+1 555 0123" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Input placeholder="New Cairo" />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button><Icons.check className="mr-2 h-4 w-4" />Save</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-64">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen && !!selected} onOpenChange={o => { setEditOpen(o); if (!o) setSelected(null) }}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>Update customer details below.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue={selected?.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" defaultValue={selected?.email} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input defaultValue={selected?.phone} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Area</label>
              <Input defaultValue={selected?.area} />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setSelected(null) }}>Cancel</Button>
            <Button><Icons.check className="mr-2 h-4 w-4" />Update</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      <AlertModal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null) }}
        onConfirm={() => { setData(p => p.filter(c => c.id !== selected?.id)); setDeleteOpen(false); setSelected(null) }}
        loading={false} />

      {/* Table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No customers found.</TableCell>
                </TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone || "—"}</TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                  <TableCell>{c.area || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.createdAt?.substring(0,10) || "—"}</TableCell>
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
                        <DropdownMenuItem onClick={() => { setSelected(c); setEditOpen(true) }}>
                          <Icons.edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelected(c); setDeleteOpen(true) }}>
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
    </div>
  )
}
