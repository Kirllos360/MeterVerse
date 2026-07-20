"use client"

import { useState, useEffect } from "react"

interface CacheEntry { id: string; key: string; value: string; hits: number; ttl: number|null; expiresAt: string|null; createdAt: string }

export default function AdminCachePage() {
  const [entries, setEntries] = useState<CacheEntry[]>([]); const [stats, setStats] = useState({totalEntries:0,totalHits:0}); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/cache").then(r=>r.json()).then(d=>{setEntries(d.entries||[]);setStats(d.stats||{});setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const flushAll = async () => { await fetch("/api/admin/cache",{method:"DELETE"}); setEntries([]); setStats({totalEntries:0,totalHits:0}) }
  const remove = async (id:string) => { await fetch(`/api/admin/cache/${id}`,{method:"DELETE"}); setEntries(prev=>prev.filter(e=>e.id!==id)) }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Cache Management</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{stats.totalEntries} entries · {stats.totalHits} total hits</p></div>
        {entries.length > 0 && <button onClick={flushAll} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>Flush All Cache</button>}
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Key","Value","Hits","TTL","Expires","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : entries.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{e.key}</td>
                <td className="px-4 py-3 text-sm font-mono max-w-[200px] truncate" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{e.value.substring(0,40)}</td>
                <td className="px-4 py-3 text-sm tabular-nums" style={{color:"#DC2626",borderBottom:"1px solid var(--admin-border)"}}>{e.hits}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{e.ttl ? `${e.ttl}s` : "∞"}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{e.expiresAt?new Date(e.expiresAt).toLocaleString():"Never"}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>remove(e.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>Evict</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

