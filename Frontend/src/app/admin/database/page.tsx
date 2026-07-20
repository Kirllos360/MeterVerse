"use client"

export default function AdminDatabasePage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Database</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Database management and maintenance</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[
          {l:"Engine",v:"PostgreSQL 16",s:"operational"},
          {l:"Host",v:"localhost:5432",s:"operational"},
          {l:"Database",v:"meter_pulse",s:"operational"},
          {l:"Tables",v:"14",s:"synced"},
          {l:"Connection Pool",v:"10",s:"healthy"},
          {l:"SSL",v:"Enabled",s:"secure"},
        ].map(i => (
          <div key={i.l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{i.l}</div><div className="text-sm font-medium mt-1" style={{color:"rgba(255,255,255,0.8)"}}>{i.v}</div>
            <div className="text-[10px] mt-1" style={{color:"#DC2626"}}>{i.s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

