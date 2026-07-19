"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { useTranslation } from "@/hooks/use-translation"
import { transitions } from "@/design-system/motion"

type EntityType = "meter" | "customer" | "invoice" | "payment" | "reading" | "none"

interface EntityConfig {
  label: string
  icon: string
  sections: { id: string; label: string; content: React.ReactNode }[]
}

export function ContextPanel() {
  const { inspectorOpen, setInspectorOpen } = useWorkspaceStore()
  const [activeTab, setActiveTab] = useState("details")
  const [entityType, setEntityType] = useState<EntityType>("none")
  const { t } = useTranslation()

  // Metadata-driven entity configs
  const entityConfigs: Record<EntityType, EntityConfig> = {
    meter: {
      label: t("context.meter", "Meter"), icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10",
      sections: [
        { id: "properties", label: t("context.properties", "Properties"), content: <PropertyRows rows={[[t("content.serial", "Serial"), "—"], [t("content.type", "Type"), "—"], [t("content.status", "Status"), "—"], [t("content.location", "Location"), "—"]]} /> },
        { id: "readings", label: t("context.readings", "Readings"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "history", label: t("context.history", "History"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "invoices", label: t("context.invoices", "Invoices"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
    customer: {
      label: t("context.customer", "Customer"), icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8",
      sections: [
        { id: "details", label: t("context.details", "Details"), content: <PropertyRows rows={[[t("content.name", "Name"), "—"], [t("content.phone", "Phone"), "—"], [t("content.email", "Email"), "—"], ["Balance", "—"]]} /> },
        { id: "meters", label: t("context.meter", "Meters"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "invoices", label: t("context.invoices", "Invoices"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "timeline", label: t("context.timeline", "Timeline"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
    invoice: {
      label: t("context.invoice", "Invoice"), icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
      sections: [
        { id: "details", label: t("context.details", "Details"), content: <PropertyRows rows={[[t("content.number", "Number"), "—"], [t("content.amount", "Amount"), "—"], [t("content.status", "Status"), "—"], ["Due Date", "—"]]} /> },
        { id: "payments", label: t("context.payments", "Payments"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "pdf", label: t("context.pdf", "PDF"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "audit", label: t("context.audit", "Audit"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
    payment: {
      label: t("context.payment", "Payment"), icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
      sections: [
        { id: "details", label: t("context.details", "Details"), content: <PropertyRows rows={[[t("content.method", "Method"), "—"], [t("content.amount", "Amount"), "—"], [t("content.date", "Date"), "—"], [t("content.status", "Status"), "—"]]} /> },
        { id: "receipt", label: t("context.receipt", "Receipt"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "allocation", label: t("context.allocation", "Allocation"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
    reading: {
      label: t("context.reading", "Reading"), icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2",
      sections: [
        { id: "details", label: t("context.details", "Details"), content: <PropertyRows rows={[[t("content.value", "Value"), "—"], [t("content.date", "Date"), "—"], ["Source", "—"], [t("content.status", "Status"), "—"]]} /> },
        { id: "history", label: t("context.history", "History"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "validation", label: t("context.validation", "Validation"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
    none: {
      label: t("context.context", "Context"), icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
      sections: [
        { id: "details", label: t("context.details", "Details"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
        { id: "activity", label: t("context.activity", "Activity"), content: <Placeholder text={t("context.selectItem", "Select an item to inspect")} /> },
      ],
    },
  }

  const config = entityConfigs[entityType]
  const sections = config.sections

  return (
    <motion.div
      className="flex flex-col h-full overflow-hidden rounded-2xl shadow-xl"
      style={{ backgroundColor: "var(--surface-base)", border: "1px solid rgba(var(--brand-primary-rgb), 0.12)" }}
      initial={false}
      animate={{ width: inspectorOpen ? "100%" : 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 shrink-0" style={{ borderBottom: "1px solid rgba(var(--white-rgb), 0.06)" }}>
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={config.icon} />
          </svg>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{config.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setInspectorOpen(false)} aria-label={t("context.closeInspector", "Collapse inspector")} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(var(--white-rgb), 0.4)" }}>
            <motion.svg animate={{ rotate: 180 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></motion.svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-2 shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid rgba(var(--white-rgb), 0.06)" }}>
        {sections.map((section) => (
          <button key={section.id} onClick={() => setActiveTab(section.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            style={{ backgroundColor: activeTab === section.id ? "rgba(var(--brand-primary-rgb), 0.15)" : "transparent", color: activeTab === section.id ? "var(--text-primary)" : "rgba(var(--white-rgb), 0.45)" }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3">
        {sections.map((section) => (
          <motion.div key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: activeTab === section.id ? 1 : 0, y: activeTab === section.id ? 0 : 8, position: activeTab === section.id ? "relative" : "absolute", pointerEvents: activeTab === section.id ? "auto" : "none" as any }}
            transition={transitions.fast}
            className={activeTab === section.id ? "" : "hidden"}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(var(--brand-primary-rgb), 0.5)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(var(--white-rgb), 0.35)" }}>{section.label}</span>
            </div>
            {section.content}
          </motion.div>
        ))}
      </div>

      {/* Entity type selector (dev tool) */}
      <div className="shrink-0 px-3 py-2 flex gap-1 flex-wrap" style={{ borderTop: "1px solid rgba(var(--white-rgb), 0.06)" }}>
        {(["meter", "customer", "invoice", "payment", "reading", "none"] as EntityType[]).map((type) => (
          <button key={type} onClick={() => setEntityType(type)}
            aria-label={`Show ${type} context`}
            className="px-2 py-1 rounded text-[10px] font-medium transition-colors"
            style={{ backgroundColor: entityType === type ? "rgba(var(--brand-primary-rgb), 0.2)" : "rgba(var(--white-rgb), 0.05)", color: entityType === type ? "var(--text-primary)" : "rgba(var(--white-rgb), 0.4)" }}
          >
            {type}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function PropertyRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="space-y-1">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-1">
          <span className="text-[11px]" style={{ color: "rgba(var(--white-rgb), 0.4)" }}>{label}</span>
          <span className="text-[11px] font-medium" style={{ color: value !== "—" ? "rgba(var(--white-rgb), 0.8)" : "rgba(var(--white-rgb), 0.25)" }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(var(--white-rgb), 0.03)" }}>
      <p className="text-[11px]" style={{ color: "rgba(var(--white-rgb), 0.3)" }}>{text}</p>
    </div>
  )
}
