"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface WorkflowDef {
  id: string
  name: string
  description: string
  version: number
  status: "active" | "draft" | "archived"
  nodes: number
  activeInstances: number
}

interface WorkflowInstance {
  id: string
  workflow: string
  startedAt: string
  currentState: string
  status: string
  entity: string
}

const MOCK_DEFS: WorkflowDef[] = [
  { id: "WF001", name: "Meter Reading Approval", description: "Approval chain for meter reading submissions", version: 3, status: "active", nodes: 5, activeInstances: 12 },
  { id: "WF002", name: "Invoice Generation", description: "Automated invoice creation and review", version: 2, status: "active", nodes: 4, activeInstances: 8 },
  { id: "WF003", name: "Disconnection Process", description: "Customer disconnection workflow with approvals", version: 1, status: "draft", nodes: 6, activeInstances: 0 },
  { id: "WF004", name: "Payment Reconciliation", description: "Payment matching and reconciliation flow", version: 2, status: "active", nodes: 3, activeInstances: 24 },
  { id: "WF005", name: "Tariff Change Request", description: "Tariff modification approval process", version: 1, status: "archived", nodes: 4, activeInstances: 0 },
]

const MOCK_INSTANCES: WorkflowInstance[] = [
  { id: "I001", workflow: "Meter Reading Approval", startedAt: "2026-07-26 08:30", currentState: "Manager Review", status: "in-progress", entity: "Reading #7821" },
  { id: "I002", workflow: "Invoice Generation", startedAt: "2026-07-26 07:00", currentState: "Completed", status: "completed", entity: "Invoice INV-2026-4512" },
  { id: "I003", workflow: "Payment Reconciliation", startedAt: "2026-07-25 16:20", currentState: "Awaiting Confirmation", status: "in-progress", entity: "Payment #8863" },
  { id: "I004", workflow: "Meter Reading Approval", startedAt: "2026-07-25 14:00", currentState: "Failed Validation", status: "failed", entity: "Reading #7805" },
  { id: "I005", workflow: "Payment Reconciliation", startedAt: "2026-07-25 11:45", currentState: "Completed", status: "completed", entity: "Payment #8841" },
]

export default function WorkflowsPage() {
  const [defs, setDefs] = useState<WorkflowDef[]>(MOCK_DEFS)
  const [instances, setInstances] = useState<WorkflowInstance[]>(MOCK_INSTANCES)
  const [live, setLive] = useState(false)

  // P45: fetch real workflow definitions + instances when the backend is reachable.
  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/api/workflows/definitions", { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null),
      fetch("/api/workflows/instances", { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null),
    ]).then(([d, i]) => {
      if (cancelled) return
      if (d?.definitions?.length) { setDefs(d.definitions.map((x: any) => ({ id: x.id, name: x.name, description: x.description, trigger: x.trigger || "MANUAL", status: x.status }))); setLive(true) }
      if (i?.instances?.length) { setInstances(i.instances.map((x: any) => ({ id: x.id, workflow: x.definition?.name || x.code || x.id, startedAt: x.createdAt, currentState: x.currentState || x.status, status: x.status, entity: x.entityType || "-" }))); setLive(true) }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Workflow Designer</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Define, manage, and monitor workflow state machines</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10-2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </motion.div>
      </div>

      {/* Workflow Definitions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
          <span className="text-sm font-bold">Workflow Definitions</span>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
            + New Workflow
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2 font-semibold">Name</th>
                <th className="text-left px-5 py-2 font-semibold">Description</th>
                <th className="text-left px-5 py-2 font-semibold">Ver</th>
                <th className="text-left px-5 py-2 font-semibold">Status</th>
                <th className="text-center px-5 py-2 font-semibold">Nodes</th>
                <th className="text-center px-5 py-2 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              {defs.map((w) => (
                <tr key={w.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5 font-semibold" style={{ color: "var(--text-primary)" }}>{w.name}</td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>{w.description}</td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>v{w.version}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: w.status === "active" ? "rgba(220,38,38,0.1)" : w.status === "draft" ? "rgba(37,99,235,0.1)" : "rgba(107,114,128,0.1)",
                        color: w.status === "active" ? "#DC2626" : w.status === "draft" ? "#2563EB" : "#6B7280",
                      }}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-center font-mono" style={{ color: "var(--text-primary)" }}>{w.nodes}</td>
                  <td className="px-5 py-2.5 text-center font-mono" style={{ color: "var(--text-primary)" }}>{w.activeInstances}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* State Machine Viewer Placeholder */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {["Start", "Validation", "Approval", "Execution", "Complete"].map((state, i) => (
            <div key={state} className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: i < 2 ? "var(--brand)" : "rgba(var(--brand-rgb),0.3)" }}>
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: i < 2 ? "var(--text-primary)" : "var(--text-secondary)" }}>{state}</span>
              {i < 4 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>}
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>State machine diagram — expand to view full workflow graph</p>
      </motion.div>

      {/* Instance Tracking */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Active & Recent Instances</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2 font-semibold">Instance</th>
                <th className="text-left px-5 py-2 font-semibold">Workflow</th>
                <th className="text-left px-5 py-2 font-semibold">Started</th>
                <th className="text-left px-5 py-2 font-semibold">Current State</th>
                <th className="text-left px-5 py-2 font-semibold">Status</th>
                <th className="text-left px-5 py-2 font-semibold">Entity</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((inst) => (
                <tr key={inst.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5 font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{inst.id}</td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{inst.workflow}</td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{inst.startedAt}</td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{inst.currentState}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: inst.status === "completed" ? "rgba(220,38,38,0.1)" : inst.status === "in-progress" ? "rgba(37,99,235,0.1)" : "rgba(220,38,38,0.1)",
                        color: inst.status === "completed" ? "#DC2626" : inst.status === "in-progress" ? "#2563EB" : "#DC2626",
                      }}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>{inst.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
