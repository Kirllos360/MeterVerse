"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"
import { LineChartCard, BarChartCard, PieChartCard } from "@/features/charts/components/ChartComponents"

export default function EnhancedInvoicesPage() {
  const [tab, setTab] = useState("dashboard")

  const statusData = [{name:"Paid",value:450},{name:"Pending",value:120},{name:"Overdue",value:45},{name:"Cancelled",value:15}]
  const revenueData = [{name:"Jan",revenue:85000},{name:"Feb",revenue:92000},{name:"Mar",revenue:88000},{name:"Apr",revenue:105000},{name:"May",revenue:98000},{name:"Jun",revenue:112000}]
  const monthlyData = [{name:"Jan",count:320},{name:"Feb",count:350},{name:"Mar",count:310},{name:"Apr",count:380},{name:"May",count:360},{name:"Jun",count:400}]

  if (tab === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Invoices Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Billing & revenue analytics</p>
          </div>
          <motion.button whileHover={{scale:1.02}} onClick={()=>setTab("list")} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{backgroundColor:"var(--brand)"}}>View All Invoices</motion.button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:"Total Invoices",value:"630",icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586"},
            {label:"Total Revenue",value:"EGP 580K",icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2"},
            {label:"Outstanding",value:"EGP 87K",icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0"},
            {label:"Collection Rate",value:"87%",icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0"},
          ].map((c,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              className="rounded-2xl border p-4" style={{backgroundColor:"var(--surface-topbar)",borderColor:"var(--border-default)"}}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full" style={{backgroundColor:"rgba(var(--brand-rgb),0.1)"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon}/></svg>
                </div>
                <span className="text-[11px]" style={{color:"var(--text-secondary)"}}>{c.label}</span>
              </div>
              <p className="text-xl font-bold" style={{color:"var(--text-primary)"}}>{c.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard title="Revenue Trend" subtitle="Monthly revenue in EGP" data={revenueData} dataKey="revenue" color="var(--brand)" />
          <BarChartCard title="Invoices Issued" subtitle="Per month" data={monthlyData} dataKey="count" color="var(--brand)" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PieChartCard title="Invoice Status" data={statusData} />
          <div className="rounded-2xl border p-5 lg:col-span-2" style={{backgroundColor:"var(--surface-topbar)",borderColor:"var(--border-default)"}}>
            <h3 className="text-sm font-bold mb-3" style={{color:"var(--text-primary)"}}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Generate Invoices","Issue Selected","Send Reminders","Export Report","Billing Settings","View Aging"].map((a,i)=>(
                <motion.button key={i} whileHover={{scale:1.02}} className="px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{backgroundColor:"var(--brand)"}}>{a}</motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <EnhancedListPage
      title="Invoices"
      description="Customer invoices and billing records"
      chartConfigs={{
        title: "Invoice Analytics",
        data1: [{name:"Jan",revenue:85000},{name:"Feb",revenue:92000},{name:"Mar",revenue:88000},{name:"Apr",revenue:105000},{name:"May",revenue:98000},{name:"Jun",revenue:112000}].map(d=>({name:d.name,value:d.revenue})),
        data2: [{name:"Paid",value:450},{name:"Pending",value:120},{name:"Overdue",value:45},{name:"Cancelled",value:15}],
        data3: [{name:"Online",value:320},{name:"Bank",value:180},{name:"Cash",value:90},{name:"Other",value:40}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"date",label:"Date"},{value:"amount",label:"Amount"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"paid",label:"Paid"},{value:"pending",label:"Pending"},{value:"overdue",label:"Overdue"}],
      }}
    >
      <GenericAdminPage config={pageConfigs.invoices} />
    </EnhancedListPage>
  )
}
