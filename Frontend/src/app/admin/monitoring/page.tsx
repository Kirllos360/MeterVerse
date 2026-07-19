"use client"

export default function AdminMonitoringPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold text-white">Monitoring</h1>
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>System performance and metrics</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <h3 className="text-sm font-medium text-white mb-3">API Performance</h3>
          <div className="space-y-2">
            {[
              { route: "GET /api/v1/customers", p50: "12ms", p95: "45ms", p99: "120ms", rate: "1,247/min" },
              { route: "GET /api/v1/meters", p50: "8ms", p95: "32ms", p99: "98ms", rate: "892/min" },
              { route: "POST /api/v1/invoices", p50: "45ms", p95: "180ms", p99: "450ms", rate: "156/min" },
            ].map((api) => (
              <div key={api.route} className="py-2 text-xs" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                <div className="text-white mb-1">{api.route}</div>
                <div className="flex gap-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>p50: {api.p50}</span><span>p95: {api.p95}</span><span>p99: {api.p99}</span><span>{api.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <h3 className="text-sm font-medium text-white mb-3">Background Jobs</h3>
          <div className="space-y-2">
            {[
              { job: "Invoice Generation", queue: "high", running: 2, pending: 15, failed: 0 },
              { job: "Report Export", queue: "default", running: 1, pending: 8, failed: 1 },
              { job: "Data Sync", queue: "low", running: 0, pending: 3, failed: 0 },
            ].map((j) => (
              <div key={j.job} className="py-2 text-xs" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                <div className="text-white mb-1">{j.job}</div>
                <div className="flex gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>Running: {j.running}</span><span>Pending: {j.pending}</span>
                  <span style={{ color: j.failed > 0 ? "var(--status-error)" : "inherit" }}>Failed: {j.failed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
