import fs from "fs"

// Fix #16: SystemLayout.tsx - fix corrupted roles entry
let layout = fs.readFileSync("D:/meter/Frontend/src/admin/layout/SystemLayout.tsx", "utf-8")
layout = layout.replace('"roles", "audit"', '"audit"')
layout = layout.replace('{ id: "roles", "audit", label: "roles", "Audit",', '{ id: "audit", label: "Audit",')
// Add proper roles entry to ADMIN_ONLY_IDS
layout = layout.replace('ADMIN_ONLY_IDS = [', 'ADMIN_ONLY_IDS = [\n    "roles",')
// Add roles nav item to System group
layout = layout.replace('{ id: "audit", label: "Audit",', '{ id: "roles", label: "Roles", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" },\n    { id: "audit", label: "Audit",')
fs.writeFileSync("D:/meter/Frontend/src/admin/layout/SystemLayout.tsx", layout)
console.log("✅ #16 Fixed: Roles in admin sidebar")

// Fix #27: Fix AdminToolbar ConnectionHeader (remove broken React.createElement approach and use proper JSX)
let tb = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")
// Replace the broken ConnectionHeader with proper one
const fixedConn = `
function ConnectionHeader() {
  const [status, setStatus] = useState("online")
  useEffect(() => {
    const check = () => fetch("/api/health").then(r => setStatus(r.ok ? "online" : "degraded")).catch(() => setStatus("offline"))
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-1.5 px-2">
      <span className={\`w-2 h-2 rounded-full shrink-0 \${status === "online" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500"}\`} />
      <span className="text-[9px] font-semibold capitalize" style={{ color: "var(--toolbar-muted)" }}>{status}</span>
    </div>
  )
}
`

// Remove broken line
const brokenLines = [
  'function ConnectionHeader() {',
  '  const [s, setS] = React.useState(\'online\');',
  '  React.useEffect(() => {',
  '    const c = () => fetch(\'/api/health\').then(r => setS(r.ok ? \'online\' : \'degraded\')).catch(() => setS(\'offline\'));',
  '    c(); const i = setInterval(c, 30000); return () => clearInterval(i);',
  '  }, []);',
  '  return React.createElement(\'div\', { className: \'flex items-center gap-1.5 px-2\' },',
  '    React.createElement(\'span\', { className: \'w-2 h-2 rounded-full shrink-0 \' + (s === \'online\' ? \'bg-green-500\' : s === \'degraded\' ? \'bg-yellow-500\' : \'bg-red-500\') }),',
  '    React.createElement(\'span\', { className: \'text-[9px] font-semibold capitalize\', style: { color: \'var(--toolbar-muted)\' } }, s)',
  '  );',
  '}',
]
for (const line of brokenLines) {
  tb = tb.replace(line, '')
}
// Add proper ConnectionHeader
tb = tb.replace('const MODE_ICONS', fixedConn + '\nconst MODE_ICONS')
// Add <ConnectionHeader /> before theme toggle
tb = tb.replace('<TbBtn label={`${t(lang, "Theme"', '<ConnectionHeader /><TbBtn label={`${t(lang, "Theme"')
fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", tb)
console.log("✅ #27 Fixed: ConnectionHeader in AdminToolbar")

console.log("\nAll fixes applied!")
