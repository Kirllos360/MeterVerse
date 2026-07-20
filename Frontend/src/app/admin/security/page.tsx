"use client"

import { useState, useEffect } from "react"

export default function AdminSecurityPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Security</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Security settings and policies</p></div>
      <div className="grid grid-cols-2 gap-4">
        {[
          {t:"Password Policy",d:"Min length: 8 chars, require special characters",s:"configured",c:"#22C55E"},
          {t:"Session Timeout",d:"60 minutes of inactivity",s:"configured",c:"#22C55E"},
          {t:"Max Login Attempts",d:"5 attempts before lockout",s:"configured",c:"#22C55E"},
          {t:"MFA Enforcement",d:"Not enabled — available in settings",s:"disabled",c:"#F59E0B"},
          {t:"CORS Policy",d:"Restricted to configured origins",s:"configured",c:"#22C55E"},
          {t:"Rate Limiting",d:"100 requests per 15 minutes",s:"active",c:"#22C55E"},
        ].map(p => (
          <div key={p.t} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-white">{p.t}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{backgroundColor:`${p.c}1a`,color:p.c}}>{p.s}</span></div>
            <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
