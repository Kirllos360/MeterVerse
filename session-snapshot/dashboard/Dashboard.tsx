"use client";
import { useMemo } from "react";
import { cn } from "@/v2/lib/cn";
import { Badge } from "@/v2/components/ui";
import { dashboardRepo } from "@/v2/repositories";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Users, Database, FileText, CreditCard, Zap } from "lucide-react";

const iconMap: Record<string, any> = { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle };

export function Dashboard() {
  const data = useMemo(() => dashboardRepo.getData(), []);
  const { kpis, alerts, activities, areaMetrics, systemHealth, upcoming } = data;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-[1100px] space-y-8">
        <div className="flex items-center justify-between animate-section animate-section-1">
          <div>
            <h1 className="text-[var(--font-heading-xl)] font-semibold tracking-tight text-[var(--text)]">Operating Center</h1>
            <p className="text-[var(--font-small)] text-[var(--text-secondary)] mt-0.5">Enterprise overview · {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-8)] bg-[var(--green-soft)] border border-[var(--green)]/20">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="text-[var(--font-caption)] font-medium text-[var(--green)]">System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3 animate-section animate-section-2">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] p-4 card-hover">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[var(--font-caption)] font-medium text-[var(--text-tertiary)]">{k.label}</span>
                <span className={k.up ? "text-[var(--green)]" : "text-[var(--red)]"}>{k.up ? "↑" : "↓"}</span>
              </div>
              <div className="text-[var(--font-heading-m)] font-semibold tracking-tight text-[var(--text)] tabular-nums">{k.value}</div>
              <div className={cn("text-[var(--font-caption)] font-medium mt-0.5", k.up ? "text-[var(--green)]" : "text-[var(--red)]")}>{k.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="animate-section animate-section-3">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">Alert Timeline</h2>
              <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] divide-y divide-[var(--border-muted)]">
                {[
                  { t:"Critical", items:alerts.filter((a) => a.severity === "danger") },
                  { t:"Warning", items:alerts.filter((a) => a.severity === "warning") },
                ].map((group) => group.items.length > 0 ? (
                  <div key={group.t}>
                    <div className="px-5 py-2.5">
                      <span className={cn("text-[var(--font-label)] font-semibold uppercase tracking-wider", group.t === "Critical" ? "text-[var(--red)]" : "text-[var(--amber)]")}>{group.t}</span>
                    </div>
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-t border-[var(--border-muted)]">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", item.severity === "danger" ? "bg-[var(--red)]" : "bg-[var(--amber)]")} />
                        <p className="text-[var(--font-small)] text-[var(--text)] flex-1 min-w-0 truncate">{item.title}</p>
                        <span className="text-[var(--font-caption)] text-[var(--text-tertiary)] shrink-0">{item.date}</span>
                      </div>
                    ))}
                  </div>
                ) : null)}
              </div>
            </div>

            <div className="animate-section animate-section-4">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">Area Performance</h2>
              <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[var(--font-label)] font-medium text-[var(--text-tertiary)] uppercase tracking-wider border-b border-[var(--border-muted)]">
                  <span>Area</span><span className="text-right">Customers</span><span className="text-right">Meters</span><span className="text-right">Revenue</span><span className="text-right">Collection</span>
                </div>
                <div className="divide-y divide-[var(--border-muted)]">
                  {areaMetrics.map((a) => (
                    <div key={a.area} className="grid grid-cols-5 gap-4 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer items-center">
                      <span className="text-[var(--font-small)] font-medium text-[var(--text)]">{a.area}</span>
                      <span className="text-[var(--font-caption)] text-[var(--text-secondary)] text-right tabular-nums">{a.customers.toLocaleString()}</span>
                      <span className="text-[var(--font-caption)] text-[var(--text-secondary)] text-right tabular-nums">{a.meters.toLocaleString()}</span>
                      <span className="text-[var(--font-caption)] font-medium text-[var(--text)] text-right tabular-nums">{a.revenue}</span>
                      <span className={cn("text-[var(--font-caption)] font-medium text-right tabular-nums", Number(a.collection.replace("%","")) >= 80 ? "text-[var(--green)]" : "text-[var(--amber)]")}>{a.collection}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-section animate-section-5">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">Recent Activity</h2>
              <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] divide-y divide-[var(--border-muted)]">
                {activities.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[var(--font-small)] text-[var(--text)] truncate">{r.action}</p>
                        <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">{r.detail}</p>
                      </div>
                    </div>
                    <span className="text-[var(--font-caption)] text-[var(--text-tertiary)] shrink-0 ml-4">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="animate-section animate-section-3">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l:"Create Customer", i:Users, d:"Add new account" },
                  { l:"Record Reading", i:Database, d:"Log meter reading" },
                  { l:"Generate Invoice", i:FileText, d:"Create invoice" },
                  { l:"Register Payment", i:CreditCard, d:"Record payment" },
                ].map((qa) => {
                  const Icon = qa.i;
                  return (
                    <button key={qa.l} className="text-left p-4 rounded-[var(--radius-10)] border border-[var(--border)] bg-[var(--bg-raised)] card-hover">
                      <Icon size={18} className="text-[var(--text-tertiary)] mb-2" />
                      <h3 className="text-[var(--font-small)] font-semibold text-[var(--text)] mb-0.5">{qa.l}</h3>
                      <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">{qa.d}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="animate-section animate-section-4">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">System Health</h2>
              <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] p-4 space-y-3">
                {systemHealth.map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full", s.status === "warning" ? "bg-[var(--amber)]" : "bg-[var(--green)]")} />
                      <span className="text-[var(--font-caption)] text-[var(--text-secondary)]">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[var(--font-caption)] font-medium", s.status === "warning" ? "text-[var(--amber)]" : "text-[var(--green)]")}>{s.status === "healthy" ? "Operational" : "Degraded"}</span>
                      <span className="text-[var(--font-label)] text-[var(--text-tertiary)]">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-section animate-section-5">
              <h2 className="text-[var(--font-heading-s)] font-semibold tracking-tight text-[var(--text)] mb-4">Upcoming</h2>
              <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-[var(--radius-10)] p-4 space-y-3">
                {upcoming.map((u) => (
                  <div key={u.label} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-[var(--font-caption)] font-medium text-[var(--text)]">{u.label}</p>
                      <p className="text-[var(--font-label)] text-[var(--text-tertiary)]">{u.date}</p>
                    </div>
                    <Badge variant="info" size="sm">{u.tag}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
