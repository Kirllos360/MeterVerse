const { chromium } = require("playwright");
const path = require("path");

const SILENT_LOGS = [
  "Download the React DevTools",
  "[HMR]",
  "[Fast Refresh]",
  "[Client Instrumentation Hook]",
  "Slow execution detected",
  "favicon.ico",
];

const ALL_WORKSPACE_APPS = [
  "executive", "ceo-dashboard", "command-center",
  "customers", "customer-groups", "contacts", "contracts",
  "invoices", "invoice-generator", "payments", "credit-notes", "tariffs",
  "meters", "meter-types", "meter-map",
  "readings", "manual-reading", "bulk-import",
  "operations", "work-orders",
  "financial", "revenue", "cash-flow",
  "reports", "financial-reports", "consumption-reports",
  "monitoring", "alerts",
  "iot",
  "users", "roles", "audit-logs",
  "security", "authentication", "api-tokens",
  "ai-center", "ai-assistant", "ai-insights",
  "settings", "system-config", "backups",
  "developer", "api-explorer", "runtime-inspector", "logs",
];

const ADMIN_SIDEBAR_ITEMS = [
  "Home", "Customers", "Meters", "Readings", "Invoices", "Payments",
  "Tariffs", "SIM Cards", "Settings", "Reports", "Services",
  "Security", "AI", "Monitor", "Users", "Roles", "Audit",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { user: {}, admin: {}, consoleErrors: [], networkErrors: [], pagesChecked: 0, buttonsClicked: 0 };

  // ====================== USER SYSTEM (Workspace) ======================
  console.log("\n========== USER SYSTEM AUDIT (localhost:7400) ==========");
  const userCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await userCtx.addInitScript(function () {
    localStorage.setItem("mv-identity", JSON.stringify({
      state: { user: { id: "dev", name: "Admin", role: "super_admin", permissions: ["all"] }, tokens: { accessToken: "dev" } },
    }));
  });
  const userPage = await userCtx.newPage();

  // Collect console messages
  userPage.on("console", (msg) => {
    const text = msg.text();
    const isSilent = SILENT_LOGS.some((s) => text.includes(s));
    if (!isSilent && (text.includes("error") || text.includes("Error") || text.includes("ERR") || msg.type() === "error")) {
      results.consoleErrors.push({ system: "user", page: userPage.url(), type: msg.type(), text: text.substring(0, 200) });
    }
  });

  // Collect failed network requests
  userPage.on("response", (resp) => {
    if (resp.status() >= 400) {
      results.networkErrors.push({ system: "user", url: resp.url().substring(0, 100), status: resp.status(), page: userPage.url() });
    }
  });

  await userPage.goto("http://localhost:7400/", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await userPage.waitForTimeout(2000);
  results.pagesChecked++;

  // Check workspace home page
  var homeOk = await userPage.evaluate(function () { return document.body.innerText.length > 200; });
  results.user.home = homeOk ? "OK" : "EMPTY";

  // Visit each workspace app
  for (var a = 0; a < ALL_WORKSPACE_APPS.length; a++) {
    var appId = ALL_WORKSPACE_APPS[a];
    try {
      // Navigate to the app page directly
      await userPage.goto("http://localhost:7400/app/" + appId, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await userPage.waitForTimeout(1500);
      results.pagesChecked++;

      // Check for content
      var text = await userPage.evaluate(function () { return document.body.innerText; });
      var hasContent = text.length > 100;
      var hasError = text.includes("Error") || text.includes("not found") || text.includes("Content not yet available");

      // Click any buttons we can find (up to 5)
      var clickCount = 0;
      var buttons = await userPage.$$("button, a[href], [role='button']");
      for (var b = 0; b < Math.min(buttons.length, 8); b++) {
        try {
          var btnText = await buttons[b].textContent().catch(() => "");
          var isClickable = await buttons[b].isVisible().catch(() => false);
          if (isClickable && btnText.length < 50) {
            await buttons[b].click().catch(() => {});
            await userPage.waitForTimeout(200);
            clickCount++;
          }
        } catch (e) {}
      }
      results.buttonsClicked += clickCount;

      var status = hasError ? "ERROR" : hasContent ? "OK" : "EMPTY";
      results.user[appId] = status;
    } catch (e) {
      results.user[appId] = "CRASH";
    }
  }

  await userCtx.close();

  // ====================== ADMIN SYSTEM ======================
  console.log("\n========== ADMIN SYSTEM AUDIT (localhost:7400/admin) ==========");
  const adminCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await adminCtx.addInitScript(function () {
    localStorage.setItem("mv-identity", JSON.stringify({
      state: { user: { id: "dev", name: "Admin", role: "super_admin", permissions: ["all"] }, tokens: { accessToken: "dev" } },
    }));
  });
  const adminPage = await adminCtx.newPage();

  adminPage.on("console", (msg) => {
    const text = msg.text();
    const isSilent = SILENT_LOGS.some((s) => text.includes(s));
    if (!isSilent && (text.includes("error") || text.includes("Error") || text.includes("ERR") || msg.type() === "error")) {
      results.consoleErrors.push({ system: "admin", page: adminPage.url(), type: msg.type(), text: text.substring(0, 200) });
    }
  });

  adminPage.on("response", (resp) => {
    if (resp.status() >= 400) {
      results.networkErrors.push({ system: "admin", url: resp.url().substring(0, 100), status: resp.status(), page: adminPage.url() });
    }
  });

  // Visit admin root
  await adminPage.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await adminPage.waitForTimeout(3000);
  results.pagesChecked++;

  var adminHomeOk = await adminPage.evaluate(function () { return document.body.innerText.length > 50; });
  results.admin.home = adminHomeOk ? "OK" : "EMPTY";

  // Click each admin sidebar item
  for (var s = 0; s < ADMIN_SIDEBAR_ITEMS.length; s++) {
    var item = ADMIN_SIDEBAR_ITEMS[s];
    try {
      // Find sidebar link by text
      var link = await adminPage.$("a");
      if (!link) {
        results.admin[item] = "NO_SIDEBAR";
        continue;
      }
      await adminPage.goto("http://localhost:7400/admin/" + item.toLowerCase().replace(/ /g, "-").replace(/[&]/g, ""), { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await adminPage.waitForTimeout(2000);
      results.pagesChecked++;

      var text = await adminPage.evaluate(function () { return document.body.innerText; });
      var hasContent = text.length > 100;
      var hasError = text.includes("Error") || text.includes("not found") || text.includes("404");

      // Click buttons
      var buttons = await adminPage.$$("button, a[href], [role='button']");
      for (var b = 0; b < Math.min(buttons.length, 5); b++) {
        try {
          var isVisible = await buttons[b].isVisible().catch(() => false);
          if (isVisible) {
            await buttons[b].click().catch(() => {});
            await adminPage.waitForTimeout(200);
            results.buttonsClicked++;
          }
        } catch (e) {}
      }

      results.admin[item] = hasError ? "ERROR" : hasContent ? "OK" : "EMPTY";
    } catch (e) {
      results.admin[item] = "CRASH";
    }
  }

  await adminCtx.close();
  await browser.close();

  // ====================== REPORT ======================
  console.log("\n\n========== FINAL AUDIT REPORT ==========");
  console.log("Pages checked: " + results.pagesChecked);
  console.log("Buttons clicked: " + results.buttonsClicked);

  console.log("\n--- CONSOLE ERRORS (" + results.consoleErrors.length + ") ---");
  for (var i = 0; i < Math.min(results.consoleErrors.length, 20); i++) {
    var e = results.consoleErrors[i];
    console.log("  [" + e.system + "] " + e.type + ": " + e.text.substring(0, 120));
  }
  if (results.consoleErrors.length > 20) console.log("  ... and " + (results.consoleErrors.length - 20) + " more");

  console.log("\n--- NETWORK ERRORS (" + results.networkErrors.length + ") ---");
  for (var i = 0; i < Math.min(results.networkErrors.length, 20); i++) {
    var e = results.networkErrors[i];
    console.log("  [" + e.system + "] " + e.status + " " + e.url.substring(0, 80));
  }
  if (results.networkErrors.length > 20) console.log("  ... and " + (results.networkErrors.length - 20) + " more");

  console.log("\n--- USER WORKSPACE APPS (40 apps) ---");
  var ok = 0, err = 0, empty = 0;
  for (var key in results.user) {
    if (key === "home") continue;
    if (results.user[key] === "OK") ok++;
    else if (results.user[key] === "ERROR") { err++; console.log("  ERROR: " + key); }
    else if (results.user[key] === "EMPTY") { empty++; console.log("  EMPTY: " + key); }
    else console.log("  " + results.user[key] + ": " + key);
  }
  console.log("User apps: " + ok + " OK, " + empty + " empty, " + err + " error");

  console.log("\n--- ADMIN PAGES (" + ADMIN_SIDEBAR_ITEMS.length + " items) ---");
  ok = 0; err = 0; empty = 0;
  for (var key in results.admin) {
    if (key === "home") continue;
    if (results.admin[key] === "OK") ok++;
    else if (results.admin[key] === "ERROR") { err++; console.log("  ERROR: " + key); }
    else if (results.admin[key] === "EMPTY") { empty++; console.log("  EMPTY: " + key); }
    else console.log("  " + results.admin[key] + ": " + key);
  }
  console.log("Admin pages: " + ok + " OK, " + empty + " empty, " + err + " error");

  console.log("\n========== AUDIT COMPLETE ==========");
}

main().catch(function (e) { console.error("FATAL:", e.message); });
