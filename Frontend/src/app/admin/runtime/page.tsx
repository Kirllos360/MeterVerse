"use client"

export default function AdminRuntimePage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Runtime</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Application runtime information</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {l:"Node.js",v:typeof process!=='undefined'?process.version:"—"},
          {l:"Next.js",v:"16.2.6"},
          {l:"Environment",v:typeof process!=='undefined'?process.env.NODE_ENV||"development":"—"},
          {l:"Platform",v:typeof process!=='undefined'?process.platform:"—"},
          {l:"Architecture",v:typeof process!=='undefined'?process.arch:"—"},
          {l:"Memory Usage",v:typeof process!=='undefined'?`${(process.memoryUsage().heapUsed/1048576).toFixed(1)} MB`:"—"},
        ].map(i => (
          <div key={i.l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{i.l}</div>
            <div className="text-sm font-mono mt-1" style={{color:"rgba(255,255,255,0.8)"}}>{i.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
