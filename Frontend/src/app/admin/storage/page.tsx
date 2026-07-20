"use client"

import { useState, useEffect } from "react"

interface StoredFile { id: string; name: string; originalName: string; mimeType: string; size: number; category: string; createdAt: string }

export default function AdminStoragePage() {
  const [files, setFiles] = useState<StoredFile[]>([]); const [totalSize, setTotalSize] = useState(0); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/storage").then(r=>r.json()).then(d=>{setFiles(d.files||[]);setTotalSize(d.totalSize||0);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const formatSize = (bytes:number) => bytes > 1048576 ? `${(bytes/1048576).toFixed(1)} MB` : bytes > 1024 ? `${(bytes/1024).toFixed(1)} KB` : `${bytes} B`
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">File Storage</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{files.length} files · {formatSize(totalSize)} total</p></div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","MIME Type","Size","Category","Uploaded"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : files.map(f => (
              <tr key={f.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}><div>{f.originalName}</div><div className="text-[10px] font-mono" style={{color:"rgba(255,255,255,0.3)"}}>{f.name}</div></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{f.mimeType}</td>
                <td className="px-4 py-3 text-sm tabular-nums" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{formatSize(f.size)}</td>
                <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:"rgba(59,130,246,0.1)",color:"#3B82F6"}}>{f.category}</span></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(f.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
