const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const dir = "D:/meter/docs/screenshots";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: false });
  console.log("  " + name + ".png");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.setExtraHTTPHeaders({ "X-Dev-Mode": "true" });

  console.log("Taking screenshots...\n");

  // Admin dashboard
  await page.goto("http://localhost:7400/admin", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await shot(page, "admin-dashboard");

  // Key pages
  const pages = ["customers", "meters", "invoices", "payments", "tariffs", "sim", "users", "projects"];
  for (const p of pages) {
    try {
      await page.goto("http://localhost:7400/admin/" + p, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(2000);
      await shot(page, "admin-" + p);
    } catch (e) {
      console.log("  FAIL " + p + ": " + e.message.slice(0, 40));
    }
  }

  // Check what the sidebar shows
  await page.goto("http://localhost:7400/admin", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).filter(a => a.href && a.href.includes("/admin/")).map(a => ({ text: a.textContent.trim().slice(0, 30), href: a.href.replace("http://localhost:7400", "") }));
  });
  console.log("\nSidebar links found:");
  links.forEach(l => console.log("  " + l.href + " -> " + l.text));

  await browser.close();
  console.log("\nDone. Screenshots in docs/screenshots/");
})();
