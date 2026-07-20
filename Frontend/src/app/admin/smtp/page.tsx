"use client"

export default function AdminSMTPPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">SMTP Configuration</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Email server settings</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Test Connection</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        {[
          {l:"SMTP Host",v:"—",p:"smtp.example.com"},{l:"Port",v:"—",p:"587"},{l:"Username",v:"—",p:"user@example.com"},{l:"Password",v:"••••••••",p:"Enter password"},{l:"From Name",v:"MeterVerse",p:"MeterVerse"},{l:"From Address",v:"noreply@meterverse.com",p:"noreply@example.com"},{l:"Encryption",v:"—",p:"TLS"},{l:"Test Recipient",v:"—",p:"admin@example.com"}
        ].map(i => (
          <div key={i.l} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
            <span style={{color:"rgba(255,255,255,0.4)"}}>{i.l}</span>
            <div className="flex items-center gap-2"><span className={i.v?"":"italic"} style={{color:i.v?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.2)"}}>{i.v||i.p}</span></div>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Configure SMTP settings in System Settings &gt; Email category</p>
    </div>
  )
}
