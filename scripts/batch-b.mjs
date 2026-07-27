import fs from "fs"

const slPath = "D:/meter/Frontend/src/admin/layout/SystemLayout.tsx"
let c = fs.readFileSync(slPath, "utf-8")

// Item 6: Add project/area selectors inline after sub-tabs section
// Find the sub-tabs div and add a project selector next to it
c = c.replace(
  '<div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">',
  '<div className="flex gap-1 overflow-x-auto py-1 scrollbar-none flex-1">'
)

// Add project + area selectors after the sub-tabs container as a sibling
c = c.replace(
  'style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>\n            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none flex-1">',
  'style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>\n          <div className="flex items-center gap-3">\n            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none flex-1">'
)

// Close the flex wrapper after sub-tabs and before project selector end
c = c.replace(
  '</div>\n          </div>\n\n          {/* PAGE CONTENT',
  '</div>\n            {/* Project + Area Selectors */}\n            <select className="text-xs px-2.5 py-1.5 rounded-xl border outline-none shrink-0" style={{ backgroundColor: "var(--toolbar-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>All Projects</option></select>\n            <select className="text-xs px-2.5 py-1.5 rounded-xl border outline-none shrink-0" style={{ backgroundColor: "var(--toolbar-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>All Areas</option></select>\n          </div>\n\n          {/* PAGE CONTENT'
)

// Item 7: Area selector in header near connection signal
// Add area text near the connection signal in AdminToolbar
let tb = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")
// Add area name text before ConnectionHeader
tb = tb.replace(
  '<ConnectionHeader />',
  '<span className="text-[10px] font-bold px-2" style={{ color: "var(--toolbar-text)" }}>October</span><ConnectionHeader />'
)
fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", tb)

// Item 8: Move search bar right by adjusting its container
tb = tb.replace(
  'className="relative flex-1 max-w-lg mx-auto"',
  'className="relative flex-1 max-w-lg" style={{ marginLeft: "auto", marginRight: "20px" }}'
)
fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", tb)

fs.writeFileSync(slPath, c)
console.log("✅ Items 6-8: Project selector, area selector, search alignment done")
