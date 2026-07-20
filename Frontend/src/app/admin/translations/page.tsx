"use client"

import { useState, useEffect } from "react"

export default function AdminTranslationsPage() {
  const [locales] = useState(["en","ar","fr","de","es","zh"])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Localization</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Language and translation management</p></div>
      <div className="grid grid-cols-3 gap-3">
        {locales.map(l => (
          <div key={l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between"><span className="text-sm font-medium uppercase text-white">{l}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{backgroundColor:l==="en"?"rgba(34,197,94,0.1)":"rgba(245,158,11,0.1)",color:l==="en"?"#DC2626":"#EF4444"}}>{l==="en"?"Complete":"In Progress"}</span>
            </div>
            <p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.3)"}}>{l==="en"?"100% translated":`${Math.floor(Math.random()*40+30)}% translated`}</p>
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{backgroundColor:"rgba(255,255,255,0.1)"}}>
              <div className="h-full rounded-full" style={{width:l==="en"?"100%":`${Math.floor(Math.random()*40+30)}%`,backgroundColor:l==="en"?"#DC2626":"#EF4444"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

