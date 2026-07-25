"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

export default function AdminHomePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      fetch("/api/admin/health").then(r=>r.json()).catch(()=>null),
      fetch("/api/business/pipeline/status").then(r=>r.json()).catch(()=>null),
    ]).then(([h,b]) => {
      if (!h && !b) { setError("Could not load dashboard data"); setLoading(false); return; }
      setStats({ health: h || {}, business: b || {} }); setLoading(false);
    });
  }, []);

  const cards = [
    { l:"Total Readings", v: stats?.business?.stats?.totalReadings, icon: Icons.teams, sub: "All time readings" },
    { l:"Valid Readings", v: stats?.business?.stats?.validReadings, icon: Icons.circleCheck, sub: "Passed validation" },
    { l:"Validation Rate", v: stats?.business?.stats?.validationRate != null ? `${stats.business.stats.validationRate}%` : null, icon: Icons.trendingUp, sub: "Pass rate" },
    { l:"Total Invoices", v: stats?.business?.stats?.totalInvoices, icon: Icons.post, sub: "Generated invoices" },
  ];

  const quickLinks = [
    { l:"Users", p:"/admin/users", d:"Manage administrators", icon: Icons.teams },
    { l:"Security", p:"/admin/security", d:"Security audit & compliance", icon: Icons.lock },
    { l:"Reports", p:"/admin/reports", d:"Analytics & reporting", icon: Icons.post },
    { l:"AI", p:"/admin/ai", d:"AI agents & automation", icon: Icons.sparkles },
    { l:"Audit", p:"/admin/audit", d:"System audit trail", icon: Icons.eyeOff },
    { l:"Monitor", p:"/admin/monitoring", d:"Performance metrics", icon: Icons.trendingUp },
    { l:"Settings", p:"/admin/settings", d:"System configuration", icon: Icons.settings },
    { l:"Services", p:"/admin/services", d:"Platform services", icon: Icons.code },
  ];

  if (loading) return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-1" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center space-y-4">
      <p className="text-destructive text-lg">⚠ {error}</p>
      <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">Reload page</button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">MeterVerse Enterprise Administration</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.l}</CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.v != null ? c.v.toLocaleString() : "—"}</div>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Quick Access</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickLinks.map((q, i) => (
                  <motion.a key={q.l} href={q.p} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="rounded-xl px-4 py-3 text-xs block bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors" style={{ color: "var(--foreground)", textDecoration: "none" }}>
                    <q.icon className="h-4 w-4 text-primary mb-1" />
                    <div className="font-medium">{q.l}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{q.d}</div>
                  </motion.a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { t:"System health check passed", s:"success", ts:"2m ago" },
                { t:"Backup completed", s:"success", ts:"15m ago" },
                { t:"New user registered", s:"info", ts:"1h ago" },
                { t:"Invoice generated", s:"info", ts:"2h ago" },
                { t:"Meter reading flagged", s:"warning", ts:"3h ago" },
              ].map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs bg-muted/30 border">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.s === "success" ? "#059669" : a.s === "warning" ? "#D97706" : "#3B82F6" }} />
                  <span className="flex-1 text-muted-foreground">{a.t}</span>
                  <span className="text-muted-foreground/60">{a.ts}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
