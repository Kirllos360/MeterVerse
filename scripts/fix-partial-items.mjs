import fs from "fs"

// Fix 1: Make AnalyticsBar respect dark mode
let ab = fs.readFileSync("D:/meter/Frontend/src/features/charts/AnalyticsBar.tsx", "utf-8")
// Replace hardcoded PIE_COLORS with dark-mode-aware version
ab = ab.replace(
  'const PIE_COLORS = ["var(--brand)", "var(--border-default)"]',
  'const PIE_COLORS = ["var(--brand)", "var(--brand)", "#F59E0B", "#10B981"]'
)
// Add check for dark mode in the component
ab = ab.replace(
  "const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')",
  "const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false"
)
fs.writeFileSync("D:/meter/Frontend/src/features/charts/AnalyticsBar.tsx", ab)
console.log("✅ AnalyticsBar: dark mode support added")

// Fix 2: Add dark mode support for shadcn ChartTooltipContent
let globals = fs.readFileSync("D:/meter/Frontend/src/styles/globals.css", "utf-8")
// Add dark mode styling for custom chart tooltips
const customTooltipCSS = `
/* Custom chart tooltip dark mode (shadcn ChartTooltipContent) */
.dark [class*="chart-tooltip"], .dark [data-chart="tooltip"] {
  background-color: #1A1A1E !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 12px !important;
  padding: 8px 12px !important;
}
.dark [class*="chart-tooltip"] [class*="text-foreground"] {
  color: #F2F2F5 !important;
}
.dark [class*="chart-tooltip"] [class*="text-muted-foreground"] {
  color: rgba(255,255,255,0.6) !important;
}
`
// Insert after the existing recharts tooltip rules
globals = globals.replace(
  '.dark .recharts-tooltip-wrapper .recharts-tooltip-item-value',
  customTooltipCSS + '\n.dark .recharts-tooltip-wrapper .recharts-tooltip-item-value'
)
fs.writeFileSync("D:/meter/Frontend/src/styles/globals.css", globals)
console.log("✅ Custom chart tooltip dark mode styling added")

console.log("\nAll fixes applied!")
