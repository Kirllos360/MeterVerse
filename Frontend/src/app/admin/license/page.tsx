"use client"

import { useState, useEffect } from "react"

interface License { id: string; key: string; type: string; status: string; seats: number; expiresAt: string|null; activatedAt: string|null; createdAt: string }

export default function AdminLicensePage() {
  const [license, setLicense] = useState<License|null>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/license").then(r=>r.json()).then(d=>{setLicense(d.license);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">License Management</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>System licensing and activation</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Activate License</button>
      </div>
      {loading ? <div className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>
      : !license ? <div className="rounded-xl border p-8 text-center" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}><div className="text-sm" style={{color:"rgba(255,255,255,0.5)"}}>No active license found</div><p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.3)"}}>Please activate a license to unlock all features</p></div>
      : <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          {[{l:"License Key",v:license.key},{l:"Type",v:license.type},{l:"Status",v:license.status},{l:"Seats",v:license.seats.toString()},{l:"Activated",v:license.activatedAt?new Date(license.activatedAt).toLocaleDateString():"—"},{l:"Expires",v:license.expiresAt?new Date(license.expiresAt).toLocaleDateString():"Never"},{l:"Created",v:new Date(license.createdAt).toLocaleDateString()}].map(({l,v})=>(
            <div key={l} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>{l}</span>
              <span className="font-mono" style={{color:"rgba(255,255,255,0.8)"}}>{v}</span>
            </div>
          ))}
        </div>}
    </div>
  )
}
