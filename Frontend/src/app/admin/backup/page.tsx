"use client"

import { useState, useEffect } from "react"

interface Backup { id: string; name: string; type: string; size: string|null; status: string; startedAt: string|null; completedAt: string|null; createdAt: string }
const STATUS_COLORS: Record<string,string> = {completed:"#DC2626",in_progress:"#DC2626",failed:"#EF4444",pending:"#EF4444"}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]); const [loading, setLoading] = useState(true); const [creating, setCreating] = useState(false)
  const fetchBackups = () => fetch("/api/admin/backups").then(r=>r.json()).then(d=>{setBackups(d.backups||[]);setLoading(false)}).catch(()=>setLoading(false))
  useEffect(() => { fetchBackups(); const i = setInterval(fetchBackups, 3000); return () => clearInterval(i) }, [])
  const createBackup = async () => { setCreating(true); await fetch("/api/admin/backups",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:`Backup ${new Date().toLocaleString()}`,type:"full"})}); setTimeout(async()=>{setCreating(false);await fetchBackups()},1000) }
  const remove = async (id:string) => { await fetch(`/api/admin/backups/${id}`,{method:"DELETE"}); setBackups(prev=>prev.filter(b=>b.id!==id)) }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Backup & Restore</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Database backup management</p></div>
        <button onClick={createBackup} disabled={creating} className="px-3 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50" style={{backgroundColor:"var(--status-error)"}}>{creating ? "Creating..." : "Create Backup"}</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","Type","Size","Status","Completed","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : backups.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No backups yet</td></tr>
            : backups.map(b => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{b.name}</td>
                <td className="px-4 py-3 text-sm capitalize" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{b.type}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{b.size||"—"}</td>
                <td className="px-4 py-3 text-sm" style={{color:STATUS_COLORS[b.status]||"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{b.status}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{b.completedAt?new Date(b.completedAt).toLocaleString():"—"}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>remove(b.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

