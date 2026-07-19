import { readFileSync, writeFileSync } from "fs"

let t = readFileSync("D:/meter/Frontend/src/styles/theme.css", "utf-8")

// Sidebar - near pure white
t = t.replace("--sidebar-text-muted: rgba(255, 255, 255, 0.85);", "--sidebar-text-muted: rgba(255, 255, 255, 0.92);")
t = t.replace("--sidebar-text-disabled: rgba(255, 255, 255, 0.5);", "--sidebar-text-disabled: rgba(255, 255, 255, 0.6);")
t = t.replace("--sidebar-icon: rgba(255, 255, 255, 0.75);", "--sidebar-icon: rgba(255, 255, 255, 0.85);")
t = t.replace("--sidebar-category-text: rgba(255, 255, 255, 0.8);", "--sidebar-category-text: rgba(255, 255, 255, 0.9);")
t = t.replace("--sidebar-count-text: rgba(255, 255, 255, 0.5);", "--sidebar-count-text: rgba(255, 255, 255, 0.7);")
t = t.replace("--sidebar-border: rgba(255, 255, 255, 0.06);", "--sidebar-border: rgba(255, 255, 255, 0.08);")

// Inspector - same
t = t.replace("--inspector-text-muted: rgba(255, 255, 255, 0.85);", "--inspector-text-muted: rgba(255, 255, 255, 0.92);")
t = t.replace("--inspector-text-disabled: rgba(255, 255, 255, 0.55);", "--inspector-text-disabled: rgba(255, 255, 255, 0.65);")
t = t.replace("--inspector-tab-text: rgba(255, 255, 255, 0.8);", "--inspector-tab-text: rgba(255, 255, 255, 0.9);")
t = t.replace("--inspector-label: rgba(255, 255, 255, 0.75);", "--inspector-label: rgba(255, 255, 255, 0.85);")

writeFileSync("D:/meter/Frontend/src/styles/theme.css", t)
console.log("Fixed sidebar/inspector text opacities to 0.85-0.92")
