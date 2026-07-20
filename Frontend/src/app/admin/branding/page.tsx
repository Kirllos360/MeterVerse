"use client"

import { useState, useEffect } from "react"

interface BrandingConfig { id: string; key: string; value: string; category: string; updatedAt: string }
const CATEGORIES = ["general","colors","logo","fonts","layout"]

export default function AdminBrandingPage() {
  const [configs, setConfigs] = useState<BrandingConfig[]>([]); const [category, setCategory] = useState("general"); const [loading, setLoading] = useState(true); const [edited, setEdited] = useState<Record<string,string>>({}); const [saving, setSaving] = useState(false)
  useEffect(() => { setLoading(true); fetch("/api/admin/branding").then(r=>r.json()).then(d=>{setConfigs(d.configs||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const filtered = configs.filter(c => c.category === category)
  const handleSave = async () => { setSaving(true); const updates = configs.map(c=>({key:c.key,value:edited[c.key]??c.value,category:c.category})); await fetch("/api/admin/branding",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({configs:updates})}); setSaving(false); setEdited({}) }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Branding</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Customize application appearance</p></div>
        {Object.keys(edited).length>0&&<button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50" style={{backgroundColor:"var(--status-error)"}}>{saving?"Saving...":`Save (${Object.keys(edited).length})`}</button>}
      </div>
      <div className="flex gap-2 pb-2">{[{id:"general",l:"General"},{id:"colors",l:"Colors"},{id:"logo",l:"Logo"},{id:"fonts",l:"Fonts"},{id:"layout",l:"Layout"}].map(c=>(<button key={c.id} onClick={()=>setCategory(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize" style={{backgroundColor:category===c.id?"var(--status-error)":"var(--admin-surface)",color:category===c.id?"white":"rgba(255,255,255,0.5)",border:category===c.id?"none":"1px solid var(--admin-border)"}}>{c.l}</button>))}</div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        {loading ? <div className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>
        : filtered.map(c => (
            <div key={c.key} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <div><div className="text-sm font-medium" style={{color:"rgba(255,255,255,0.8)"}}>{c.key.split(".").pop()?.replace(/_/g," ")}</div><div className="text-[10px] font-mono mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>{c.key}</div></div>
              <div className="w-64"><input value={edited[c.key]??c.value} onChange={e=>setEdited({...edited,[c.key]:e.target.value})} className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none" style={{backgroundColor:"var(--admin-surface)",borderColor:edited[c.key]!==undefined&&edited[c.key]!==c.value?"var(--status-error)":"var(--admin-border)",color:"white"}}/></div>
            </div>
          ))}
      </div>
    </div>
  )
}
