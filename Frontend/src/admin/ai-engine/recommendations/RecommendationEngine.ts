export interface Recommendation {
  id: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "high" | "medium" | "low"
  category: "billing" | "operations" | "maintenance" | "efficiency"
  reasoning: string
  actions: { label: string; actionId: string; reversible: boolean }[]
  confidence: number
}

export class RecommendationEngine {
  async getRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: "rec_001", title: "Review Meter M-2042 Consumption Spike",
        description: "Meter M-2042 shows 3× normal consumption. Investigate for fault, theft, or data error.",
        impact: "high", effort: "medium", category: "operations",
        reasoning: "Statistical anomaly detection flagged this meter. 12,450 kWh vs expected 4,200 kWh average.",
        actions: [{ label: "Review Meter", actionId: `rec_action_${Date.now()}`, reversible: false }],
        confidence: 0.94,
      },
      {
        id: "rec_002", title: "Optimize Billing Cycle",
        description: "12 invoices are overdue by 30+ days. Consider adjusting payment terms or initiating collection.",
        impact: "high", effort: "low", category: "billing",
        reasoning: "Aging analysis shows $23,450 in overdue receivables. Early collection could improve cash flow by 15%.",
        actions: [{ label: "View Overdue Invoices", actionId: `rec_action_${Date.now() + 1}`, reversible: false }],
        confidence: 0.87,
      },
      {
        id: "rec_003", title: "Schedule Preventive Maintenance",
        description: "Meters M-1087 and M-3015 have shown anomalies. Schedule maintenance to prevent downtime.",
        impact: "medium", effort: "medium", category: "maintenance",
        reasoning: "Two meters in Zone B have shown irregular readings. Preventive maintenance can reduce failure risk by 60%.",
        actions: [{ label: "Schedule Maintenance", actionId: `rec_action_${Date.now() + 2}`, reversible: true }],
        confidence: 0.82,
      },
    ]
  }
}
