"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MeterItem {
  id: string; serial?: string; type?: string; status: string; area?: string; location?: string;
  customer?: { id?: string; name?: string }; _count?: { readings?: number };
}

const TYPE_ICONS: Record<string, string> = { electric: "⚡", water: "💧", gas: "🔥", solar: "☀️" };
const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", inactive: "secondary", maintenance: "outline", retired: "destructive",
};
const RELAY_SIGNALS = ["online", "offline", "fault", "alert", "maintenance"];
const ROWS_PER_PAGE = 8;

const ACTIONS = [
  { id: "view", label: "View", api: (m: MeterItem) => `/admin/meters/${m.id}`, type: "navigate" as const },
  { id: "readings", label: "Readings", api: (m: MeterItem) => `/admin/readings?meterId=${m.id}`, type: "navigate" as const },
  { id: "assign", label: "Assign", api: (m: MeterItem) => `/admin/meter-assignments?meterId=${m.id}`, type: "navigate" as const },
  { id: "sim", label: "SIM", api: (m: MeterItem) => `/admin/sim?meterId=${m.id}`, type: "navigate" as const },
  { id: "edit", label: "Edit", api: () => "", type: "toast" as const },
  { id: "activate", label: "Activate", api: (m: MeterItem) => `/api/meters/${m.id}`, type: "api" as const, body: { status: "active" } },
  { id: "deactivate", label: "Deactivate", api: (m: MeterItem) => `/api/meters/${m.id}`, type: "api" as const, body: { status: "inactive" } },
  { id: "maintain", label: "Maintain", api: (m: MeterItem) => `/api/meters/${m.id}`, type: "api" as const, body: { status: "maintenance" } },
  { id: "terminate", label: "Terminate", api: (m: MeterItem) => `/api/meters/${m.id}/terminate`, type: "api" as const, body: { reason: "Manual" } },
  { id: "export", label: "Export", api: () => `/api/meters/export`, type: "navigate" as const },
  { id: "delete", label: "Delete", api: (m: MeterItem) => `/api/meters/${m.id}`, type: "api" as const, method: "DELETE" as const },
];

export default function MeterRelayPage() {
  const router = useRouter();
  const [meters, setMeters] = useState<MeterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError(null);
    apiClient<{ meters: MeterItem[] }>("/api/meters")
      .then(d => { setMeters(d.meters || []); setLoading(false); })
      .catch(e => { setError(e.message || "Failed to load"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = meters.filter(m =>
    !search || (m.serial || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.type || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.area || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleAction = async (m: MeterItem, action: typeof ACTIONS[0]) => {
    setActionLoading(`${action.id}-${m.id}`);
    try {
      if (action.type === "navigate") {
        const url = action.api(m);
        if (url.startsWith("/admin")) router.push(url);
        else window.open(url, "_blank");
      } else if (action.type === "api") {
        const method = action.method || "PUT";
        await apiClient(action.api(m), { method, body: action.body ? JSON.stringify(action.body) : undefined });
        toast.success(`${action.label} successful`);
        load();
      } else {
        toast.info(`${action.label} — action triggered`);
      }
    } catch (e: any) { toast.error(`${action.label} failed: ${e.message || "Unknown error"}`); }
    setActionLoading(null);
  };

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Skeleton className="h-52" /><Skeleton className="h-52" /></div></div>;

  if (error) return <div className="p-6 text-center space-y-4"><p className="text-destructive text-lg">⚠ Failed to load meters</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" onClick={load}>Retry</Button></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Meter Management</h1><p className="text-sm text-muted-foreground">{filtered.length} meters</p></div>
        <div className="flex gap-2">
          <Input placeholder="Search serial, type, area..." className="w-72" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Button variant="outline" onClick={() => router.push("/admin")}>Back</Button>
        </div>
      </div>

      {paged.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground text-lg">No meters found</p><p className="text-sm text-muted-foreground mt-1">{search ? "Try a different search term." : "Add a meter to get started."}</p></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paged.map(m => (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{TYPE_ICONS[m.type || ""] || "📟"}</span>
                  {m.serial || m.id.slice(0, 8)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className={"w-2 h-2 rounded-full " + (m.status === "active" ? "bg-red-600" : m.status === "maintenance" ? "bg-yellow-500" : "bg-gray-400")} />
                  <Badge variant={STATUS_COLORS[m.status] || "outline"}>{m.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1 flex-wrap">
                {RELAY_SIGNALS.map(s => (
                  <span key={s} className={"text-xs px-2 py-0.5 rounded " + (
                    s === "online" && m.status === "active" ? "bg-red-100 text-red-700" :
                    s === "offline" && m.status !== "active" ? "bg-red-100 text-red-700" :
                    s === "maintenance" && m.status === "maintenance" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-400"
                  )}>{s}</span>
                ))}
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {m.type}</p>
                <p><span className="text-muted-foreground">Area:</span> {m.area || m.location || "—"}</p>
                <p><span className="text-muted-foreground">Customer:</span> {m.customer?.name || "—"}</p>
                <p><span className="text-muted-foreground">Readings:</span> {m._count?.readings ?? 0}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ACTIONS.map(a => (
                  <Button key={a.id} variant={a.id === "terminate" || a.id === "delete" ? "destructive" : "outline"} size="sm"
                    disabled={actionLoading === `${a.id}-${m.id}`}
                    onClick={() => handleAction(m, a)}>
                    {actionLoading === `${a.id}-${m.id}` ? "..." : a.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground py-1">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

