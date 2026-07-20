"use client"

export default function AdminPluginsPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Plugins</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Extend functionality with plugins</p></div>
      <div className="rounded-xl border p-8 text-center" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <div className="text-2xl mb-2" style={{color:"rgba(255,255,255,0.2)"}}>🔌</div>
        <div className="text-sm" style={{color:"rgba(255,255,255,0.5)"}}>Plugin Marketplace</div>
        <p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.3)"}}>Extend MeterVerse with community and official plugins. Marketplace coming soon.</p>
        <button disabled className="mt-4 px-4 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"var(--admin-surface)",color:"rgba(255,255,255,0.3)",border:"1px solid var(--admin-border)"}}>Browse Marketplace — Coming Soon</button>
      </div>
    </div>
  )
}
