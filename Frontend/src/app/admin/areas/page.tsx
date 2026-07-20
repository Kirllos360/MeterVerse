"use client"

export default function AdminAreasPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Areas</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Geographical and operational areas</p></div>
      <div className="grid grid-cols-3 gap-3">
        {["October","New Cairo","SODIC","Sheikh Zayed","North Coast","Red Sea"].map(a => (
          <div key={a} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{a}</span><span className="text-[10px] px-2 py-0.5 rounded-full" style={{backgroundColor:"rgba(34,197,94,0.1)",color:"#DC2626"}}>active</span></div>
            <p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.3)"}}>MeterVerse operational zone</p></div>
        ))}
      </div>
    </div>
  )
}

