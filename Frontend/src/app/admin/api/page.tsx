"use client"

export default function AdminAPIUsagePage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">API Usage</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>API request monitoring and rate limits</p></div>
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:"Requests Today",v:"1,247",c:"#3B82F6"},{l:"Avg Response",v:"42ms",c:"#22C55E"},{l:"Error Rate",v:"0.3%",c:"#22C55E"},{l:"Rate Limit",v:"100/15m",c:"#F59E0B"}
        ].map(s => (
          <div key={s.l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-xl font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <div className="px-4 py-3 border-b" style={{borderColor:"var(--admin-border)"}}><h2 className="text-sm font-semibold text-white">API Endpoints</h2></div>
        {["GET /api/health","POST /api/auth/login","GET /api/admin/users","GET /api/admin/audit","GET /api/admin/settings"].map(e => (
          <div key={e} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
            <span className="font-mono" style={{color:"rgba(255,255,255,0.7)"}}>{e}</span><span className="text-[10px] px-2 py-0.5 rounded" style={{backgroundColor:"rgba(34,197,94,0.1)",color:"#22C55E"}}>200</span>
          </div>
        ))}
      </div>
    </div>
  )
}
