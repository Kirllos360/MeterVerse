"use client"

import { useState, useEffect } from "react"

export default function AdminNotificationsPage() {
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Notifications</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>System notification configuration</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[
          {n:"Email Notifications",s:"Active",c:"#DC2626",d:"Transactional and system emails"},
          {n:"Push Notifications",s:"Coming Soon",c:"#EF4444",d:"Browser and mobile push"},
          {n:"SMS Alerts",s:"Not Configured",c:"#EF4444",d:"Configure SMS gateway first"},
          {n:"Slack Webhooks",s:"Not Configured",c:"rgba(255,255,255,0.3)",d:"Slack integration coming soon"},
          {n:"Webhook Deliveries",s:"Active",c:"#DC2626",d:"Outgoing webhook notifications"},
          {n:"In-App Alerts",s:"Active",c:"#DC2626",d:"Dashboard notification center"},
        ].map(i => (
          <div key={i.n} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{i.n}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{backgroundColor:`${i.c}1a`,color:i.c}}>{i.s}</span></div>
            <p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{i.d}</p></div>
        ))}
      </div>
    </div>
  )
}

