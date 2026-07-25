"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface MeterItem {
  id: string; serial?: string; type?: string; status: string; area?: string; location?: string;
  customer?: { name?: string }; _count?: { readings?: number };
}

const TYPE_ICONS: Record<string, string> = { electric: "⚡", water: "💧", gas: "🔥", solar: "☀️" };
const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", inactive: "secondary", maintenance: "outline", retired: "destructive",
};
const RELAY_SIGNALS = ["online", "offline", "fault", "alert", "maintenance"];
const ACTIONS = [
  { id: "view", label: "View Details" }, { id: "edit", label: "Edit Meter" },
  { id: "readings", label: "View Readings" }, { id: "assign", label: "Assign Customer" },
  { id: "sim", label: "Manage SIM" }, { id: "terminate", label: "Terminate" },
  { id: "maintain", label: "Set Maintenance" }, { id: "activate", label: "Activate" },
  { id: "deactivate", label: "Deactivate" }, { id: "export", label: "Export Data" },
  { id: "delete", label: "Delete" },
];

export default function MeterRelayPage() {
  const [meters, setMeters] = useState<MeterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ meters: MeterItem[] }>("/api/meters").then(d => {
      setMeters(d.meters || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAction = (meterId: string, action: string) => {
    toast.info(`${action} triggered for meter ${meterId.slice(0, 8)}...`);
  };

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32" /></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Meter Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {meters.map(m => (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{TYPE_ICONS[m.type || ""] || "📟"}</span>
                  {m.serial || m.id.slice(0, 8)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className={"w-2 h-2 rounded-full " + (m.status === "active" ? "bg-green-500" : "bg-gray-400")} />
                  <Badge variant={STATUS_COLORS[m.status] || "outline"}>{m.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1">
                {RELAY_SIGNALS.map(s => (
                  <span key={s} className={"text-xs px-2 py-0.5 rounded " + (s === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {m.type}</p>
                <p><span className="text-muted-foreground">Area:</span> {m.area || m.location || "—"}</p>
                <p><span className="text-muted-foreground">Customer:</span> {m.customer?.name || "—"}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ACTIONS.map(a => (
                  <Button key={a.id} variant="outline" size="sm" onClick={() => handleAction(m.id, a.id)}>
                    {a.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
