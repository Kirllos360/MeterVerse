"use client"

import { useState, useEffect } from "react"

export default function AdminThemesPage() {
  const [themes] = useState(["vercel","claude","supabase","mono","notebook","zen","astro-vista","whatsapp"])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Themes</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Application theme management</p></div>
      <div className="grid grid-cols-4 gap-3">
        {themes.map(t => (
          <div key={t} className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-[var(--status-error)]" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="w-full h-16 rounded-lg mb-2" style={{background:`linear-gradient(135deg, ${t==="vercel"?"#000,#fff":t==="claude"?"#d4a574,#f5e6d3":t==="supabase"?"#3ecf8e,#1c1c1c":t==="mono"?"#333,#999":t==="notebook"?"#f5f0e8,#333":t==="zen"?"#e8f5e9,#1b5e20":t==="astro-vista"?"#1a1a2e,#e94560":"#25d366,#075e54"})`}}/>
            <div className="text-xs font-medium capitalize" style={{color:"rgba(255,255,255,0.7)"}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
