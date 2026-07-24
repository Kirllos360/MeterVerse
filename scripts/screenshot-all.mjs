import { chromium } from "playwright";

async function screenshot(page, name) {
  await page.screenshot({ path: `D:/meter/docs/screenshots/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Set dev mode header
  await page.setExtraHTTPHeaders({ "X-Dev-Mode": "true" });

  console.log("Taking screenshots of all admin pages...\n");

  // Admin dashboard
  await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await screenshot(page, "admin-dashboard");
  console.log("  Sidebar links:", await page.locator("a[href^='/admin/']").all().then(links => links.length));

  // List pages
  const pages = ["customers", "meters", "invoices", "payments", "readings", "tariffs", "sim", "projects", "users", "roles", "audit", "backup", "cache", "queue", "health", "sessions", "settings", "dashboard"];
  for (const p of pages) {
    try {
      await page.goto(`http://localhost:7400/admin/${p}`, { waitUntil: "networkidle", timeout: 15000 });
      await screenshot(page, `admin-${p}`);
    } catch (e) {
      console.log(`  ❌ ${p}: ${e.message?.slice(0, 50)}`);
    }
  }

  // Check what "Customer Group" shows
  try {
    await page.goto("http://localhost:7400/admin/customer-groups", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await screenshot(page, "admin-customer-groups");
  } catch {}

  await browser.close();
  console.log("\n✅ All screenshots saved to docs/screenshots/");
}

main().catch(console.error);
