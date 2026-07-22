import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { fileURLToPath } from "url"

const __dirname = join(fileURLToPath(import.meta.url), "..")
const FRONTEND = join(__dirname, "..")
const entities = ["customers", "meters", "readings", "invoices", "payments", "meter-assignments"]

for (const e of entities) {
  const path = join(FRONTEND, "src", "app", "api", "meterverse", e, "[id]", "route.ts")
  try {
    let c = readFileSync(path, "utf8")
    const orig = c
    
    // Fix 1: params is Promise — need to await
    c = c.replace(/const \{ id \} = await params/g, 'const { id } = await params')
    
    // Fix 2: Replace direct params.id with await params.id
    c = c.replace(/params\.id/g, '(await params).id')
    
    // Fix 3: Update function signatures  
    c = c.replace(/export async function (GET|PUT|DELETE)\([^)]+\)/g, (match) => {
      return match
    })
    
    // Add import for NextRequest  
    if (!c.includes('NextRequest')) {
      c = c.replace('from "next/server"', 'from "next/server"\nimport type { NextRequest } from "next/server"')
    }
    
    if (c !== orig) {
      writeFileSync(path, c, "utf8")
      console.log(`Fixed: ${e}/[id]/route.ts`)
    }
  } catch (err) {
    console.log(`Error: ${e}/[id]/route.ts — ${err.message}`)
  }
}
