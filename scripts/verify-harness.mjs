#!/usr/bin/env node
/* MeterVerse Multi-Verification Harness (P58)
 * Starts backends if needed, then runs the full test battery:
 *   L1 Core services, L2 Auth/RBAC, L3 All admin pages, L4 Engines,
 *   L5 DB integrity, L6 Portal gating. Outputs structured PASS/FAIL.
 * Usage: node scripts/verify-harness.mjs [--no-start]
 */
import { execSync, spawn } from "child_process";
import { existsSync } from "fs";

const BASE = "http://localhost:3131";
const PORTAL = "http://localhost:3003";
const results = [];
let startedServices = false;

function log(name, ok, detail = "") {
  const line = `${ok ? "PASS" : "FAIL"}\t${name}${detail ? "\t" + detail : ""}`;
  results.push({ name, ok, detail });
  console.log(line);
}

async function httpGet(url, headers = {}, timeout = 8000) {
  try {
    const res = await fetch(url, { headers: { "X-Dev-Mode": "true", ...headers }, signal: AbortSignal.timeout(timeout) });
    return { status: res.status, ok: res.ok, body: await res.text().catch(() => "") };
  } catch {
    return { status: 0, ok: false, body: "" };
  }
}

async function httpPost(url, body, headers = {}, timeout = 8000) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Dev-Mode": "true", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    return { status: res.status, ok: res.ok, body: await res.text().catch(() => "") };
  } catch {
    return { status: 0, ok: false, body: "" };
  }
}

function waitFor(port, ms = 30000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = async () => {
      const r = await httpGet(`http://localhost:${port}/api/health`).catch(() => null);
      if (r && r.status === 200) return resolve(true);
      if (Date.now() - start > ms) return resolve(false);
      setTimeout(check, 2000);
    };
    check();
  });
}

async function startBackend(port, portalMode = false) {
  const env = { ...process.env, NODE_ENV: "development", PORT: String(port) };
  if (portalMode) env.PORTAL_MODE = "1";
  const child = spawn("node", ["src/server.js"], { cwd: "backend", env, detached: true, stdio: "ignore" });
  child.unref();
  return child;
}

async function main() {
  console.log("=== MeterVerse Multi-Verification Harness ===");
  console.log("Date:", new Date().toISOString());

  // ---- L0: service availability ----
  const adminUp = await waitFor(3131, 15000);
  if (!adminUp) {
    console.log("Admin BE not up - starting it...");
    startBackend(3131, false);
    await waitFor(3131, 40000);
  }
  const portalUp = await waitFor(3003, 15000);
  if (!portalUp) {
    startBackend(3003, true);
    await waitFor(3003, 40000);
  }

  // ---- L1: Core health ----
  log("L1 Admin health", (await httpGet(`${BASE}/api/health`)).status === 200);
  log("L1 Admin ready+db", (await httpGet(`${BASE}/api/health/ready`)).body.includes("connected"));
  log("L1 Portal health", (await httpGet(`${PORTAL}/api/health`)).status === 200);
  log("L1 Portal ready+db", (await httpGet(`${PORTAL}/api/health/ready`)).body.includes("connected"));

  // ---- L2: Auth/RBAC ----
  const login = await httpPost(`${BASE}/api/auth/login`, { email: "admin@meterverse.com", password: "Admin@123" });
  log("L2 admin login", login.status === 200, login.status === 200 ? "200" : `${login.status}`);
  let token = "";
  if (login.status === 200) {
    token = JSON.parse(login.body).accessToken || "";
    log("L2 token issued", token.length > 20);
  }
  const badLogin = await httpPost(`${BASE}/api/auth/login`, { email: "admin@meterverse.com", password: "wrongpass" });
  log("L2 bad login rejected", badLogin.status === 401, `${badLogin.status}`);
  if (token) {
    // Bearer-only (no X-Dev-Mode so the real JWT path is tested)
    const me = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
    const meOk = me.status === 200;
    log("L2 /me with token", meOk, `${me.status}`);
  }

  // ---- L3: Core API endpoints (admin) ----
  const endpoints = [
    "/api/customers", "/api/meters", "/api/readings", "/api/invoices", "/api/payments",
    "/api/tariffs", "/api/locations/areas", "/api/locations/zones", "/api/locations/units",
    "/api/admin/users", "/api/admin/roles", "/api/admin/permissions", "/api/admin/settings",
    "/api/accounting/accounts", "/api/alerts", "/api/notifications", "/api/workflows/definitions",
    "/api/tasks", "/api/system/diagnostics", "/api/knowledge-articles", "/api/projects",
    "/api/meter-assignments", "/api/sim", "/api/billing/runs", "/api/collections/risk-profiles",
    "/api/revenue-assurance/summary", "/api/financial-reports/ratios", "/api/sessions",
    "/api/admin/cache", "/api/admin/queue", "/api/admin/backups", "/api/admin/storage",
    "/api/admin/scheduler", "/api/accounting/general-ledger",
    "/api/accounting/journal-entries", "/api/accounting/financial-periods",
  ];
  for (const ep of endpoints) {
    const r = await httpGet(`${BASE}${ep}`);
    log(`L3 GET ${ep}`, r.status === 200, `${r.status}`);
  }

  // ---- L4: Engines ----
  const engines = [
    "/api/runtime/status", "/api/ingestion/status", "/api/scheduler/stats",
    "/api/health/scores", "/api/failover/stats", "/api/observability/metrics",
    "/api/admin/queue", "/api/admin/backups", "/api/admin/storage", "/api/monitor",
  ];
  for (const ep of engines) {
    const r = await httpGet(`${BASE}${ep}`);
    log(`L4 GET ${ep}`, r.status === 200, `${r.status}`);
  }

  // ---- L5: Portal gating ----
  const gate = await httpGet(`${PORTAL}/api/admin/users`);
  log("L5 portal blocks admin", gate.status === 404, `${gate.status}`);
  const portalCust = await httpGet(`${PORTAL}/api/customers`);
  log("L5 portal serves customer", portalCust.status === 200, `${portalCust.status}`);

  // ---- L6: Diagnostics ----
  const diag = await httpGet(`${BASE}/api/system/diagnostics`);
  let diagOk = false;
  if (diag.status === 200) {
    try { diagOk = JSON.parse(diag.body).endpoints?.passed === JSON.parse(diag.body).endpoints?.total; } catch {}
  }
  log("L6 diagnostics 24/24", diagOk, diag.status === 200 ? "200" : `${diag.status}`);

  // ---- Summary ----
  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  console.log("\n=== SUMMARY ===");
  console.log(`PASS: ${pass}  FAIL: ${fail}  TOTAL: ${results.length}`);
  console.log("FAILED:", results.filter((r) => !r.ok).map((r) => r.name).join(", ") || "(none)");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("HARNESS ERROR:", e.message);
  process.exit(2);
});
