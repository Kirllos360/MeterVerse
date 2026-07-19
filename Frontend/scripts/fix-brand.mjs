import { readFileSync, writeFileSync } from "fs"

// Fix sidebar/inspector colors to brand-matching teal
let theme = readFileSync("D:/meter/Frontend/src/styles/theme.css", "utf-8")

theme = theme.replace(
  "--sidebar-background: color-mix(in srgb, var(--brand) 20%, black)",
  "--sidebar-background: #064E3B"
)
theme = theme.replace(
  "--inspector-background: color-mix(in srgb, var(--brand) 15%, black)",
  "--inspector-background: #043526"
)
theme = theme.replace(
  "--panel-accent: color-mix(in srgb, var(--brand) 22%, black)",
  "--panel-accent: #064E3B"
)
writeFileSync("D:/meter/Frontend/src/styles/theme.css", theme)
console.log("✅ Fixed: sidebar/inspector colors to brand teal")
