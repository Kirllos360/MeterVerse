#!/usr/bin/env node
/**
 * MeterVerse OS — Master Launcher
 * Starts: PostgreSQL (check) → Admin Backend (:3131) → Admin Frontend (:3535)
 *         → Portal Backend (:3003) → Portal Frontend (:3030)
 * Health-checks every service, retries failures, prints a colored summary.
 *
 * NOTE: Next.js cannot run two dev servers on one source tree simultaneously.
 * If both admin FE (3535) and portal FE (3030) are requested, this launcher
 * starts the admin profile by default; pass --portal-frontend alone to run the
 * portal profile instead (or use production Docker for both).
 */
import { spawn } from "node:child_process"

const PORT = { adminFrontend: 3535, adminBackend: 3131, portalFrontend: 3030, portalBackend: 3003 }
const color = (code, s) => `\x1b[${code}m${s}\x1b[0m`
const ok = s => color("32", s)
const warn = s => color("33", s)
const err = s => color("31", s)
const dim = s => color("90", s)
const bold = s => color("1", s)

const FLAGS = {
  admin: !process.argv.includes("--portal-only"),
  portal: process.argv.includes("--portal-only"),
  portalFrontend: process.argv.includes("--portal-frontend"),
}

function logStart(name) {
  console.log(`\n${bold("▶")} ${bold(name)} starting...`)
}

function spawnService(name, cmd) {
  logStart(name)
  const child = spawn(cmd, { cwd: process.cwd(), shell: true, stdio: "inherit" })
  child.on("error", e => console.log(err(`  ✗ ${name} failed to start: ${e.message}`)))
  return child
}

async function waitHealthy(url, name, timeoutMs = 60000, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
        if (res.ok) {
          console.log(ok(`  ✔ ${name} healthy on ${url}`))
          return true
        }
      } catch {}
      await new Promise(r => setTimeout(r, 2000))
    }
    if (attempt < retries) console.log(warn(`  ⚠ ${name} not ready, retrying (${attempt}/${retries})...`))
  }
  console.log(err(`  ✗ ${name} FAILED to become healthy on ${url}`))
  return false
}

async function checkService(url, name) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    return { name, url, status: res.ok ? "ok" : "down" }
  } catch {
    return { name, url, status: "down" }
  }
}

async function main() {
  console.log(bold("\n╔══════════════════════════════════════════════╗"))
  console.log(bold("║     METERVERSE OS — MASTER LAUNCHER          ║"))
  console.log(bold("╚══════════════════════════════════════════════╝"))
  console.log(dim("Admin FE :3535 · Admin API :3131 · Portal FE :3030 · Portal API :3003"))

  const dbUrl = process.env.DATABASE_URL || "postgresql://meter_pulse:meter_pulse_dev@localhost:5432/meter_pulse?schema=public"
  const jwt = process.env.JWT_SECRET || "mv-jwt-secret-change-in-production-2026"
  const cors = "http://localhost:3030,http://localhost:3535"

  // 1. Backends
  if (FLAGS.admin) {
    spawnService("Admin Backend", `cd backend && set DATABASE_URL=${dbUrl}&& set JWT_SECRET=${jwt}&& set CORS_ORIGIN=${cors}&& set PORT=${PORT.adminBackend}&& node src/server.js`)
    await waitHealthy(`http://localhost:${PORT.adminBackend}/api/health/ready`, "Admin Backend")
  }
  if (FLAGS.portal) {
    spawnService("Portal Backend", `cd backend && set DATABASE_URL=${dbUrl}&& set JWT_SECRET=${jwt}&& set CORS_ORIGIN=${cors}&& set PORT=${PORT.portalBackend}&& set PORTAL_MODE=1&& node src/server.js`)
    await waitHealthy(`http://localhost:${PORT.portalBackend}/api/health/ready`, "Portal Backend")
  }

  // 2. Frontends
  if (FLAGS.admin) {
    spawnService("Admin Frontend", `cd Frontend && set NEXT_PUBLIC_API_URL=http://localhost:${PORT.adminBackend}&& call node_modules\\.bin\\next.cmd dev -p ${PORT.adminFrontend}`)
    await waitHealthy(`http://localhost:${PORT.adminFrontend}`, "Admin Frontend")
  }
  if (FLAGS.portalFrontend) {
    spawnService("Portal Frontend", `cd Frontend && set PORTAL_MODE=1&& set NEXT_PUBLIC_API_URL=http://localhost:${PORT.portalBackend}&& call node_modules\\.bin\\next.cmd dev -p ${PORT.portalFrontend}`)
    await waitHealthy(`http://localhost:${PORT.portalFrontend}`, "Portal Frontend")
  }

  // 3. Final health summary
  console.log(bold("\n═══════════ FINAL HEALTH SUMMARY ═══════════"))
  const targets = [
    { name: "Admin Frontend", url: `http://localhost:${PORT.adminFrontend}` },
    { name: "Admin Backend", url: `http://localhost:${PORT.adminBackend}/api/health` },
    { name: "Portal Frontend", url: `http://localhost:${PORT.portalFrontend}` },
    { name: "Portal Backend", url: `http://localhost:${PORT.portalBackend}/api/health` },
  ]
  const results = await Promise.all(targets.map(t => checkService(t.url, t.name)))
  results.forEach(r => {
    const icon = r.status === "ok" ? ok("✔") : err("✗")
    console.log(`  ${icon} ${r.name.padEnd(18)} ${dim(r.url)} ${r.status === "ok" ? ok("OK") : err("DOWN")}`)
  })
  const allOk = results.every(r => r.status === "ok")
  console.log(allOk ? ok("\n✅ All requested services healthy.") : warn("\n⚠ Some services are not healthy — see above."))
  console.log(bold("\nURLs:") + `\n  Admin Console  ${ok("http://localhost:3535")}\n  Customer Portal ${ok("http://localhost:3030")}\n  Admin API       ${ok("http://localhost:3131/api/health")}\n  Portal API      ${ok("http://localhost:3003/api/health")}`)
  console.log("\nPress Ctrl+C to stop all services.\n")
  process.exit(allOk ? 0 : 1)
}

main().catch(e => { console.error(err("FATAL: " + e.message)); process.exit(1) })
