"use client"

export default function AdminLocalizationPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Localization</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Regional and locale settings</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {l:"Default Language",v:"English (en)"},{l:"Fallback Locale",v:"en"},{l:"Timezone",v:"Africa/Cairo"},{l:"Date Format",v:"DD/MM/YYYY"},{l:"Number Format",v:"1,234.56"},{l:"Currency",v:"EGP (E£)"},{l:"First Day of Week",v:"Sunday"},{l:"Measurement",v:"Metric"},
        ].map(i => (
          <div key={i.l} className="flex items-center justify-between rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <span className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{i.l}</span><span className="text-sm font-medium text-white">{i.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
