"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AnomalyDetector } from "@/admin/ai-engine/anomaly/AnomalyDetector"
import { ForecastEngine } from "@/admin/ai-engine/forecast/ForecastEngine"
import { RecommendationEngine } from "@/admin/ai-engine/recommendations/RecommendationEngine"
import { ReportSummarizer } from "@/admin/ai-engine/summaries/ReportSummarizer"
import { LogViewer } from "@/enterprise/log-viewer/LogViewer"
import type { LogEntry } from "@/enterprise/log-viewer/LogViewer"

export default function AIDiagnosticsPage() {
  const [activeTab, setActiveTab] = useState("anomalies")
  const [anomalies, setAnomalies] = useState<unknown[]>([])
  const [logs] = useState<LogEntry[]>([])
  const [scanning, setScanning] = useState(false)

  const runDiagnostic = async () => {
    setScanning(true)
    const detector = new AnomalyDetector()
    const results = await detector.detectAnomalies()
    setAnomalies(results)
    setScanning(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--admin-text)" }}>AI Diagnostics</h1>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>System health analysis and issue detection</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={runDiagnostic}
          className="px-4 py-2 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: scanning ? "var(--admin-accent-muted)" : "var(--admin-accent)" }}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Run Diagnostic"}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2" style={{ borderColor: "var(--admin-border)" }}>
        {["anomalies", "forecast", "recommendations", "summaries", "logs"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
            style={{ backgroundColor: activeTab === tab ? "var(--admin-accent-subtle)" : "transparent", color: activeTab === tab ? "var(--admin-accent)" : "var(--admin-text-muted)" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Anomalies */}
      {activeTab === "anomalies" && (
        <div className="space-y-2">
          {anomalies.length === 0 ? (
            <div className="p-8 text-center text-sm rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)", color: "var(--admin-text-dim)" }}>
              Run a diagnostic to detect anomalies
            </div>
          ) : (anomalies as Array<{ id: string; meterSerial: string; type: string; severity: string; value: number; explanation: string }>).map((a) => (
            <div key={a.id} className="p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "var(--admin-text)" }}>{a.meterSerial} — {a.type}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: a.severity === "high" ? "rgba(var(--status-error-rgb), 0.2)" : "rgba(var(--status-warning-rgb), 0.2)", color: a.severity === "high" ? "var(--status-error)" : "var(--status-warning)" }}>
                  {a.severity}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{a.explanation}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--admin-text-dim)" }}>Value: {a.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Forecast */}
      {activeTab === "forecast" && (
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>Forecast engine ready — connect to backend data</p>
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>Recommendation engine ready — connect to backend data</p>
        </div>
      )}

      {/* Summaries */}
      {activeTab === "summaries" && (
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>Report summarizer ready — connect to backend data</p>
        </div>
      )}

      {/* Logs */}
      {activeTab === "logs" && (
        <LogViewer logs={logs} />
      )}
    </div>
  )
}
