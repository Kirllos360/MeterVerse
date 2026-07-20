"use client"

export default function AdminSMSPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">SMS Configuration</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>SMS gateway settings</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {n:"Twilio",s:"Not Configured",c:"#EF4444",d:"Account SID, Auth Token, From Number"},
          {n:"Vonage (Nexmo)",s:"Not Configured",c:"#EF4444",d:"API Key, API Secret, From Number"},
          {n:"AWS SNS",s:"Not Configured",c:"rgba(255,255,255,0.3)",d:"Access Key, Secret Key, Region"},
          {n:"MessageBird",s:"Not Configured",c:"rgba(255,255,255,0.3)",d:"API Key, Originator"},
        ].map(i => (
          <div key={i.n} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{i.n}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{backgroundColor:`${i.c}1a`,color:i.c}}>{i.s}</span></div>
            <p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{i.d}</p></div>
        ))}
      </div>
    </div>
  )
}

