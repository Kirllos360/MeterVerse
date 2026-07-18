import { AIBase } from "../shared/ai-base"

export interface SearchResult {
  id: string
  type: "meter" | "customer" | "invoice" | "reading" | "report"
  label: string
  description: string
  relevance: number
  action?: () => void
}

export interface NLSearchQuery {
  raw: string
  intent: "lookup" | "compare" | "analyze" | "find" | "unknown"
  entities: { type: string; value: string }[]
  filters: { field: string; operator: string; value: string }[]
}

export class NaturalLanguageSearch extends AIBase {
  private mockData: SearchResult[] = [
    { id: "meter_2042", type: "meter", label: "Meter M-2042", description: "Electricity meter - Zone A, Building 3", relevance: 0 },
    { id: "customer_451", type: "customer", label: "Ahmed Hassan", description: "Residential customer - Zone A", relevance: 0 },
    { id: "invoice_8901", type: "invoice", label: "INV-2026-8901", description: "$1,234.56 - Due Aug 15", relevance: 0 },
    { id: "reading_3345", type: "reading", label: "Reading #3345", description: "Meter M-2042 - 4,567 kWh", relevance: 0 },
  ]

  parseQuery(raw: string): NLSearchQuery {
    const q = raw.toLowerCase()
    const intent: NLSearchQuery["intent"] = 
      q.includes("find") || q.includes("search") || q.includes("show") ? "find" :
      q.includes("compare") || q.includes("vs") ? "compare" :
      q.includes("analyze") || q.includes("check") ? "analyze" :
      q.includes("lookup") || q.includes("get") ? "lookup" : "unknown"

    const entities: { type: string; value: string }[] = []
    const meterMatch = q.match(/meter[\s-]*([a-z0-9]+)/i)
    if (meterMatch) entities.push({ type: "meter", value: meterMatch[1] })
    const customerMatch = q.match(/customer[\s-]*([a-z0-9]+)/i)
    if (customerMatch) entities.push({ type: "customer", value: customerMatch[1] })
    const invoiceMatch = q.match(/(?:invoice|inv)[\s-]*([a-z0-9]+)/i)
    if (invoiceMatch) entities.push({ type: "invoice", value: invoiceMatch[1] })

    return { raw, intent, entities, filters: [] }
  }

  search(query: string): SearchResult[] {
    const parsed = this.parseQuery(query)
    const q = query.toLowerCase()

    let results = this.mockData
      .map((r) => ({ ...r, relevance: this.calculateRelevance(r, q, parsed) }))
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)

    if (results.length === 0) {
      results = [{
        id: `suggest_${Date.now()}`, type: "report",
        label: `Search for "${query}" in all pages`,
        description: "No direct matches found. Search across all modules?",
        relevance: 50,
      }]
    }

    return results
  }

  private calculateRelevance(result: SearchResult, query: string, _parsed: NLSearchQuery): number {
    let score = 0
    if (result.label.toLowerCase().includes(query)) score += 50
    if (result.description.toLowerCase().includes(query)) score += 30
    for (const entity of _parsed.entities) {
      if (result.label.toLowerCase().includes(entity.value.toLowerCase())) score += 40
      if (result.type === entity.type) score += 20
    }
    return score
  }
}
