import { readFileSync, writeFileSync } from "fs"

const ROOT = "D:/meter/Frontend/src/app/login/page.tsx"
let c = readFileSync(ROOT, "utf-8")

// The flex layout was reserving space for absolute-positioned children
// Fix: change outer div to "relative min-h-screen" and make the content container NOT a flex child
c = c.replace(
  '<div className="flex min-h-screen"',
  '<div className="relative min-h-screen"'
)

// Make the content container use absolute positioning to fill the parent
c = c.replace(
  '<div className="flex-1 flex items-center justify-center p-12 relative z-10">',
  '<div className="absolute inset-0 flex items-center justify-center p-12 z-10">'
)

// Increase form width significantly  
c = c.replace('max-w-xl', 'max-w-3xl')

// Increase spacing
c = c.replace('mb-16', 'mb-20')
c = c.replace('space-y-6', 'space-y-8')

// Larger inputs
c = c.replace('h-14', 'h-16')
c = c.replace('text-sm', 'text-base')

// Larger title
c = c.replace('text-3xl font-bold', 'text-4xl font-bold')
c = c.replace('w-16 h-16', 'w-20 h-20')
c = c.replace('width="32" height="32"', 'width="40" height="40"')

writeFileSync(ROOT, c)
console.log("✅ Fixed: login page now fills entire viewport")
