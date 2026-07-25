"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// T095: Balances page with 5 tabs (Water/Electric/Solar/Chilled/Gas)
const TABS = [
  { id: "electric", label: "Electric ⚡" },
  { id: "water", label: "Water 💧" },
  { id: "solar", label: "Solar ☀️" },
  { id: "chilled", label: "Chilled ❄️" },
  { id: "gas", label: "Gas 🔥" },
];

export default function BalancesPage() {
  const [activeTab, setActiveTab] = useState("electric");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customer Balances</h1>
      <div className="flex gap-2 border-b pb-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
              activeTab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">EGP 0.00</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overdue (30d+)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">EGP 0.00</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Due This Period</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">EGP 0.00</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>{TABS.find(t => t.id === activeTab)?.label} Balance Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No outstanding balances for this utility type.</p>
        </CardContent>
      </Card>
    </div>
  );
}
