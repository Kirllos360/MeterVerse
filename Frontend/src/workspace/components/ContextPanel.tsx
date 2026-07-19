"use client"

import { useState } from "react"
import { useWorkspaceStore } from "../stores"
import { useTranslation } from "@/hooks/use-translation"

type EntityType = "meter" | "customer" | "invoice" | "payment" | "reading" | "none"

interface EntityConfig {
  label: string
  icon: string
  sections: { id: string; label: string; content: React.ReactNode }[]
}

export function ContextPanel() {
  const { inspectorOpen, setInspectorOpen } = useWorkspaceStore()
  const [activeTab, setActiveTab] = useState("properties")
  const [entityType, setEntityType] = useState<EntityType>("none")
  const { t } = useTranslation()

  const entityConfigs: Record<EntityType, EntityConfig> = {
    meter: {
      label: t("context.meter", "Meter"), icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10",
      sections: [
        { id: "properties", label: "Properties", content: <PropertyRows rows={[["Serial", "MV-10001"], ["Type", "Electric"], ["Status", "Active"], ["Location", "Building A"]]} /> },
        { id: "timeline", label: "Timeline", content: <TimelineItems items={[["Reading taken", "2h ago"], ["Maintenance", "3d ago"], ["Installed", "6mo ago"]]} /> },
        { id: "activity", label: "Activity", content: <ActivityItems items={[["Reading uploaded", "2h ago"], ["Status changed", "3d ago"], ["Invoice generated", "5d ago"]]} /> },
        { id: "attachments", label: "Attachments", content: <Placeholder text="No attachments yet" /> },
      ],
    },
    customer: {
      label: t("context.customer", "Customer"), icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8",
      sections: [
        { id: "properties", label: "Properties", content: <PropertyRows rows={[["Name", "Palm Hills"], ["Phone", "+20 100 000 000"], ["Email", "billing@palmhills.com"], ["Balance", "$2,450"]]} /> },
        { id: "timeline", label: "Timeline", content: <TimelineItems items={[["Contract signed", "1mo ago"], ["Account created", "3mo ago"]]} /> },
        { id: "activity", label: "Activity", content: <ActivityItems items={[["Invoice paid", "1d ago"], ["Meter assigned", "1w ago"]]} /> },
        { id: "attachments", label: "Attachments", content: <Placeholder text="No attachments yet" /> },
      ],
    },
    invoice: {
      label: t("context.invoice", "Invoice"), icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
      sections: [
        { id: "properties", label: "Properties", content: <PropertyRows rows={[["Number", "INV-2024-0892"], ["Amount", "$1,250.00"], ["Status", "Pending"], ["Due Date", "Aug 15, 2026"]]} /> },
        { id: "timeline", label: "Timeline", content: <TimelineItems items={[["Invoice sent", "1w ago"], ["Payment due", "2w from now"]]} /> },
        { id: "activity", label: "Activity", content: <ActivityItems items={[["Email sent", "1w ago"], ["Reminder sent", "3d ago"]]} /> },
        { id: "attachments", label: "Attachments", content: <Placeholder text="Generated PDF available" /> },
      ],
    },
    payment: {
      label: t("context.payment", "Payment"), icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
      sections: [
        { id: "properties", label: "Properties", content: <PropertyRows rows={[["Method", "Bank Transfer"], ["Amount", "$1,250.00"], ["Date", "Jul 15, 2026"], ["Status", "Completed"]]} /> },
        { id: "timeline", label: "Timeline", content: <TimelineItems items={[["Payment received", "1h ago"]]} /> },
        { id: "activity", label: "Activity", content: <ActivityItems items={[["Invoice updated", "1h ago"], ["Receipt sent", "1h ago"]]} /> },
        { id: "attachments", label: "Attachments", content: <Placeholder text="Receipt PDF available" /> },
      ],
    },
    reading: {
      label: t("context.reading", "Reading"), icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2",
      sections: [
        { id: "properties", label: "Properties", content: <PropertyRows rows={[["Value", "1,234 kWh"], ["Date", "Jul 18, 2026"], ["Source", "Manual"], ["Status", "Valid"]]} /> },
        { id: "timeline", label: "Timeline", content: <TimelineItems items={[["Reading recorded", "2h ago"], ["Last reading", "30d ago"]]} /> },
        { id: "activity", label: "Activity", content: <ActivityItems items={[["Validation passed", "2h ago"], ["Billing cycle", "3d ago"]]} /> },
        { id: "attachments", label: "Attachments", content: <Placeholder text="No attachments yet" /> },
      ],
    },
    none: {
      label: "Inspector", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
      sections: [
        { id: "properties", label: "Properties", content: <Placeholder text="Select an item to inspect" /> },
        { id: "activity", label: "Activity", content: <Placeholder text="Select an item to inspect" /> },
      ],
    },
  }

  const config = entityConfigs[entityType]
  const sections = config.sections

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="shrink-0 sticky top-0 z-10" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round">
              <path d={config.icon} />
            </svg>
            <span className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>{config.label}</span>
          </div>
          <button onClick={() => setInspectorOpen(false)} aria-label="Close inspector" className="w-6 h-6 flex items-center justify-center transition-colors hover:opacity-70" style={{ color: "var(--text-tertiary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className="px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap rounded"
              style={{
                    color: activeTab === section.id ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
                    backgroundColor: activeTab === section.id ? "var(--sidebar-active)" : "transparent",
                opacity: activeTab === section.id ? 1 : 0.7,
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section.id} className={activeTab === section.id ? "" : "hidden"}>
            {section.content}
          </div>
        ))}
      </div>

      {/* Dev tool — entity type selector */}
      <div className="shrink-0 px-3 py-2 flex gap-1 flex-wrap" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {(["meter", "customer", "invoice", "payment", "reading", "none"] as EntityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setEntityType(type)}
            className="px-1.5 py-0.5 text-[9px] font-medium transition-colors rounded"
            style={{
              color: entityType === type ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
              backgroundColor: entityType === type ? "var(--sidebar-active)" : "transparent",
            }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}

function PropertyRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--sidebar-text-muted)" }}>{label}</span>
          <span className="text-sm" style={{ color: "var(--sidebar-text)" }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function TimelineItems({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-0">
      {items.map(([title, time], i) => (
        <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--sidebar-text-muted)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs" style={{ color: "var(--sidebar-text)" }}>{title}</div>
          </div>
          <span className="text-[10px] shrink-0" style={{ color: "var(--sidebar-text-muted)" }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

function ActivityItems({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-2">
      {items.map(([title, time]) => (
        <div key={title} className="flex items-center gap-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--sidebar-selected)" }} />
          <div className="flex-1 min-w-0">
            <span className="text-xs" style={{ color: "var(--sidebar-text)" }}>{title}</span>
          </div>
          <span className="text-[10px] shrink-0" style={{ color: "var(--sidebar-text-muted)" }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm" style={{ color: "var(--sidebar-text-muted)" }}>{text}</p>
    </div>
  )
}
