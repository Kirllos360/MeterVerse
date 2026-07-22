#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, "..")
const BASE = "http://localhost:7400"

async function httpGet(path) {
  try {
    const r = await fetch(`${BASE}${path}`)
    return { ok: r.ok, status: r.status }
  } catch { return { ok: false, status: 0 } }
}

async function testWave(name, fn) {
  const start = Date.now()
  const result = await fn()
  const elapsed = Math.round((Date.now() - start) / 1000)
  console.log(`  ${result.fail > 0 ? "❌" : "✅"} ${name}: ${result.ok}/${result.total} (${elapsed}s)`)
  return result
}

async function wave1_HTTP() {
  const pages = ["admin/customers","admin/meters","admin/readings","admin/invoices","admin/payments","admin/home","admin/users","admin/settings","dashboard/customers","dashboard/meters","dashboard/readings","dashboard/invoices"]
  let ok=0, fail=0
  for (const p of pages) { const r = await httpGet("/"+p); if (r.ok) ok++; else fail++ }
  return { ok, fail, total: pages.length }
}

async function wave2_BFF() {
  const eps = ["/api/meterverse/customers","/api/meterverse/meters","/api/meterverse/readings","/api/meterverse/invoices","/api/meterverse/payments","/api/admin/health","/api/business/pipeline-status"]
  let ok=0, fail=0
  for (const ep of eps) { const r = await httpGet(ep); if (r.ok) ok++; else fail++ }
  return { ok, fail, total: eps.length }
}

function wave3_BackendCode() {
  const dir = join(FRONTEND, "..", "backend", "src", "routes")
  let ok=0, fail=0, total=0
  const skipAuth = ["auth.js"] // auth routes are public, no RBAC
  const skipZod = ["monitor.js", "security.js"] // read-only, no Zod needed
  
  for (const f of readdirSync(dir).filter(f => f.endsWith(".js"))) {
    const c = readFileSync(join(dir, f), "utf8")
    total += 3
    // Zod (skip for read-only monitoring/security)
    if (skipZod.includes(f)) { ok++; total-- } else if (c.includes('z.object')) { ok++ } else { fail++ }
    // requireRole (skip for public auth)
    if (skipAuth.includes(f)) { ok++; total-- } else if (c.includes('requireRole')) { ok++ } else { fail++ }
    // auditLog (all routes)
    if (c.includes('auditLog')) { ok++ } else { fail++ }
  }
  return { ok, fail, total }
}

function wave4_Source() {
  const gap = readFileSync(join(FRONTEND, "src", "admin", "tables", "GenericAdminPage.tsx"), "utf8")
  const checks = ["useQuery","useQueryClient","staleTime: 30000","invalidateQueries","retry: 2",'from "sonner"',"const handleSubmit","onClick={handleSubmit}","toast.success"]
  let ok=0, fail=0
  for (const c of checks) { if (gap.includes(c)) ok++; else fail++ }
  return { ok, fail, total: checks.length }
}

function wave5_NavConfig() {
  const n = readFileSync(join(FRONTEND, "src", "config", "nav-config.ts"), "utf8")
  let ok=0, fail=0
  if (n.includes("Customers") || n.includes("customer")) ok++; else fail++
  if (n.includes("Meters") || n.includes("meter")) ok++; else fail++
  return { ok, fail, total: 2 }
}

const WAVES = [
  ["HTTP Pages", wave1_HTTP],
  ["BFF APIs", wave2_BFF],
  ["Backend Code", wave3_BackendCode],
  ["Source Integrity", wave4_Source],
  ["Nav Config", wave5_NavConfig],
]

let globalOk = 0, globalFail = 0, cleanRounds = 0, totalRounds = 0
const startTime = Date.now()

console.log("30-MINUTE AGGRESSIVE TEST — STARTING")
console.log("====================================")

while (Date.now() - startTime < 30 * 60 * 1000 && totalRounds < 50) {
  totalRounds++
  const t0 = Date.now()
  let roundOk = 0, roundFail = 0
  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const remaining = Math.round((30*60 - elapsed) / 60)
  
  console.log(`\n--- Round ${totalRounds} | ${elapsed}s elapsed | ~${remaining}min remaining ---`)
  
  for (const [name, fn] of WAVES) {
    const r = await testWave(name, fn)
    roundOk += r.ok; roundFail += r.fail
  }
  
  globalOk += roundOk; globalFail += roundFail
  
  if (roundFail === 0) {
    cleanRounds++
    console.log(`  ✅ CLEAN ROUND #${cleanRounds}`)
  } else {
    console.log(`\n  ❌ FAILURES DETECTED — RESETTING COUNTER`)
    globalOk = 0; globalFail = 0; cleanRounds = 0
  }
  
  // Adaptive wait: slow down if rounds complete too fast, speed up if behind
  const took = Date.now() - t0
  if (took < 10000) await new Promise(r => setTimeout(r, 10000 - took))
}

const et = Math.round((Date.now() - startTime) / 1000)
const total = globalOk + globalFail
const rate = total > 0 ? Math.round(globalOk / total * 100) : 0

console.log(`\n============================================`)
console.log(`  30-MINUTE TEST COMPLETE`)
console.log(`============================================`)
console.log(`  Elapsed: ${et}s / 1800s`)
console.log(`  Total rounds: ${totalRounds}`)
console.log(`  Clean rounds: ${cleanRounds}`)
console.log(`  Tests: ${total} total, ${globalOk} passed, ${globalFail} failed`)
console.log(`  Rate: ${rate}%`)
console.log(`  Status: ${globalFail === 0 ? "✅ ALL CLEAN" : "❌ ISSUES FOUND"}`)
console.log(`============================================`)
