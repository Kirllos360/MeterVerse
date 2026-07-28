import { Icons } from "@/components/icons"
import type { PageConfig } from "../page-config"
import { statusField, defFields, sc } from "./_helpers"

export const utilityConfigs: Record<string, PageConfig> = {
  business: {
    id: "business", title: "Business Pipeline", description: "Meter reading and billing pipeline status",
    apiEndpoint: "/api/business/pipeline/status",
    statusField,
    transform: (d: any) => (d.recentRuns || []).map((r: any) => ({
      id: r.id || r.cycle, name: r.cycle || r.name || "Run",
      period: r.period || "—", status: r.status || "active",
      count: r.count || r.readings || 0, amount: r.amount || 0,
      date: r.createdAt || r.date || "",
    })),
    columns: [
      { id: "name", header: "Cycle", accessor: r => r.name, width: 140 },
      { id: "period", header: "Period", accessor: r => r.period, width: 120 },
      { id: "count", header: "Count", accessor: r => r.count, type: "number", width: 80 },
      { id: "amount", header: "Amount", accessor: r => `EGP ${(r.amount||0).toLocaleString()}`, width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "date", header: "Date", accessor: r => r.date, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Runs", Icons.clock, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  crud: {
    id: "crud", title: "Enterprise CRUD", description: "Soft Delete · Bulk · Import · Export · Undo · Archive · Approval · Version History",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  runtime: {
    id: "runtime", title: "Runtime Engine", description: "Metadata-driven app generation — define entities in JSON, get full CRUD automatically",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  tables: {
    id: "tables", title: "Enterprise Tables", description: "Column presets · Resize · Reorder · Pin · Inline Edit · Grouping · Aggregation · Filters · Saved Views · Bulk Actions · Export · Keyboard Shortcuts",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
}
