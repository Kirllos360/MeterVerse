export interface ReportSummary {
  id: string
  reportType: string
  period: string
  summary: string
  keyFindings: string[]
  metrics: { label: string; value: string; change: string }[]
  generatedAt: number
}

export class ReportSummarizer {
  async summarize(reportType: string, _data?: Record<string, unknown>): Promise<ReportSummary> {
    const summaries: Record<string, ReportSummary> = {
      consumption: {
        id: `summary_${Date.now()}`, reportType: "consumption", period: "July 2026",
        summary: "Total energy consumption for July 2026 was 52,340 kWh, a 2.8% decrease from June. Import accounted for 65% (34,021 kWh) and export for 35% (18,319 kWh). Peak consumption occurred on July 15 at 2,450 kWh/day.",
        keyFindings: [
          "Overall consumption decreased 2.8% month-over-month",
          "Peak consumption day: July 15 (2,450 kWh)",
          "Lowest consumption day: July 4 (1,120 kWh) — likely holiday effect",
          "Import/Export ratio stable at 65/35",
          "Zone A accounts for 42% of total consumption",
        ],
        metrics: [
          { label: "Total Consumption", value: "52,340 kWh", change: "-2.8%" },
          { label: "Peak Day", value: "2,450 kWh", change: "+5.2%" },
          { label: "Avg Daily", value: "1,688 kWh", change: "-2.8%" },
          { label: "Import Ratio", value: "65%", change: "0%" },
        ],
        generatedAt: Date.now(),
      },
      billing: {
        id: `summary_${Date.now() + 1}`, reportType: "billing", period: "July 2026",
        summary: "Total invoices generated: $67,890. Collected: $52,340 (77.1%). Outstanding: $15,550. 12 invoices are overdue by 30+ days totaling $4,230.",
        keyFindings: [
          "Collection rate at 77.1% — below 90% target",
          "12 invoices overdue 30+ days",
          "3 new customers added this month",
          "Average invoice value: $1,234",
        ],
        metrics: [
          { label: "Total Invoiced", value: "$67,890", change: "+5.1%" },
          { label: "Collected", value: "$52,340", change: "+3.2%" },
          { label: "Collection Rate", value: "77.1%", change: "-1.8%" },
          { label: "Overdue", value: "$4,230", change: "+12.3%" },
        ],
        generatedAt: Date.now(),
      },
    }

    return summaries[reportType] || {
      id: `summary_${Date.now()}`, reportType, period: "Current",
      summary: `Summary for ${reportType} report is being generated.`,
      keyFindings: ["Report data is being analyzed"],
      metrics: [{ label: "Status", value: "Generating", change: "—" }],
      generatedAt: Date.now(),
    }
  }
}
