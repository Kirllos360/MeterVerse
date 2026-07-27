import fs from "fs"

let c = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")

// Fix import on line 3
c = c.replace('useEffect  from', 'useEffect } from')

// Remove the broken line 14 (stray inline code)
const lines = c.split("\n")
const fixedLines = lines.filter(line => !line.includes("const [s, setS] = useState"))
// Remove duplicate ConnectionHeader
let firstConn = false
const finalLines = fixedLines.filter(line => {
  if (line.includes("function ConnectionHeader")) {
    if (firstConn) return false
    firstConn = true
  }
  return true
})

c = finalLines.join("\n")
// Fix empty double blank lines
c = c.replace(/\n\n\n+/g, "\n\n")

fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", c)
console.log("Fixed AdminToolbar.tsx")
