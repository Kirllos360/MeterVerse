"use client"

export default function AdminIntegrationsPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Integrations</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Third-party service integrations</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {n:"SMTP Server",s:"Not configured",c:"#F59E0B",d:"Configure email sending"},
          {n:"SMS Gateway",s:"Not configured",c:"#F59E0B",d:"Configure SMS notifications"},
          {n:"OAuth Providers",s:"Coming Soon",c:"rgba(255,255,255,0.3)",d:"Google, Microsoft, GitHub SSO"},
          {n:"Webhook System",s:"Active",c:"#22C55E",d:"Outgoing webhook endpoints"},
          {n:"API Access",s:"Active",c:"#22C55E",d:"REST API with key auth"},
          {n:"File Storage",s:"Local",c:"#22C55E",d:"Local filesystem storage"},
        ].map(i => (
          <div key={i.n} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{i.n}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{backgroundColor:`${i.c}1a`,color:i.c}}>{i.s}</span></div>
            <p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
