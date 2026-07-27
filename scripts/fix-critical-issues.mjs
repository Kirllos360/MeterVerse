import fs from "fs"

// Fix #27: Add connection signal to AdminToolbar header
let tb = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")

// Add useState, useEffect if not already imported
if (!tb.includes("useEffect")) {
  tb = tb.replace('import { useState, useRef, useEffect } from "react"', 'import { useState, useRef, useEffect } from "react"')
}

// Add ConnectionHeader component right after MODE_ICONS
const connCode = `
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

tb = tb.replace("const MODE_ICONS", connCode + "\nconst MODE_ICONS")

// Add <ConnectionHeader /> before theme toggle
tb = tb.replace('<TbBtn label={`${t(lang, "Theme"', '<ConnectionHeader /><TbBtn label={`${t(lang, "Theme"')

fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", tb)
console.log("✅ #27 Fixed")

// Verify TypeScript
const { execSync } = await import("child_process")
try {
  execSync("npx tsc --noEmit --pretty", { cwd: "D:/meter/Frontend", stdio: "pipe" })
  console.log("✅ TypeScript: 0 errors")
} catch (e) {
  console.log("❌ TypeScript errors")
}
