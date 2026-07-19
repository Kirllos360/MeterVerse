import { readFileSync, writeFileSync } from "fs"

// Fix ContextPanel - remove hardcoded text-shadows
let c = readFileSync("D:/meter/Frontend/src/workspace/components/ContextPanel.tsx", "utf-8")
c = c.replace(/textShadow: ".*?",?\n?\s*/g, "")
writeFileSync("D:/meter/Frontend/src/workspace/components/ContextPanel.tsx", c)
console.log("✅ Removed hardcoded text-shadows from ContextPanel")

// Fix SidebarContent - remove any hardcoded text-shadows
let s = readFileSync("D:/meter/Frontend/src/workspace/components/SidebarContent.tsx", "utf-8")
s = s.replace(/textShadow: ".*?",?\n?\s*/g, "")
writeFileSync("D:/meter/Frontend/src/workspace/components/SidebarContent.tsx", s)
console.log("✅ Checked SidebarContent")

console.log("\nDone")
