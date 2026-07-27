import fs from "fs"

let c = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")

// Add ConnectionHeader after TbBtn function
const conn = `
function ConnectionHeader() {
  const [s, setS] = React.useState("online")
  React.useEffect(() => {
    const c = () => fetch("/api/health").then(r => setS(r.ok ? "online" : "degraded")).catch(() => setS("offline"))
    c()
    const i = setInterval(c, 30000)
    return () => clearInterval(i)
  }, [])
  return React.createElement("div", { className: "flex items-center gap-1.5 px-2" },
    React.createElement("span", { className: \`w-2 h-2 rounded-full shrink-0 \${s === "online" ? "bg-green-500" : s === "degraded" ? "bg-yellow-500" : "bg-red-500"}\` }),
    React.createElement("span", { className: "text-[9px] font-semibold capitalize", style: { color: "var(--toolbar-muted)" } }, s)
  )
}
`

// Actually, simpler approach: just add it as a normal component
const fixedConn = `
function ConnectionHeader() {
  const [status, setStatus] = useState("online")
  useEffect(() => {
    const check = () => fetch("/api/health").then(r => setStatus(r.ok ? "online" : "degraded")).catch(() => setStatus("offline"))
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])
  return React.createElement("div", { className: "flex items-center gap-1.5 px-2" },
    React.createElement("span", { className: \`w-2 h-2 rounded-full shrink-0 \${status === "online" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500"}\` }),
    React.createElement("span", { className: "text-[9px] font-semibold capitalize", style: { color: "var(--toolbar-muted)" } }, status)
  )
}
`

// Use JSX approach - this should work
c = c.replace(
  "function TbBtn",
  `function ConnectionHeader() {
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

function TbBtn`
)

// Add ConnectionHeader before theme toggle
c = c.replace('<TbBtn label={`${t(lang, "Theme"', '<ConnectionHeader /><TbBtn label={`${t(lang, "Theme"')
// Remove duplicate (keep the first occurrence only)
const first = c.indexOf("function ConnectionHeader")
const last = c.lastIndexOf("function ConnectionHeader")
if (first !== last) {
  c = c.substring(0, first) + c.substring(c.indexOf("\n", c.indexOf("function TbBtn")))
}

fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", c)
console.log("✅ ConnectionHeader added")
