const { chromium } = require("playwright");
const path = require("path");

const ADMIN_ROUTES = [
  { label: "Admin Home", path: "/admin" },
  { label: "Admin Customers", path: "/admin/customers" },
  { label: "Admin Meters", path: "/admin/meters" },
  { label: "Admin Readings", path: "/admin/readings" },
  { label: "Admin Invoices", path: "/admin/invoices" },
  { label: "Admin Payments", path: "/admin/payments" },
  { label: "Admin Tariffs", path: "/admin/tariffs" },
  { label: "Admin SIM", path: "/admin/sim" },
  { label: "Admin Users", path: "/admin/users" },
  { label: "Admin Roles", path: "/admin/roles" },
  { label: "Admin Audit", path: "/admin/audit" },
  { label: "Admin Settings", path: "/admin/settings" },
  { label: "Admin Reports", path: "/admin/reports" },
  { label: "Admin Services", path: "/admin/services" },
  { label: "Admin Security", path: "/admin/security" },
  { label: "Admin AI", path: "/admin/ai" },
  { label: "Admin Monitor", path: "/admin/monitor" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { consoleErrors: [], networkErrors: [], pageResults: {} };

  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx.addInitScript(function () {
    localStorage.setItem("mv-identity", JSON.stringify({
      state: { user: { id: "dev", name: "Admin", role: "super_admin", permissions: ["all"] }, tokens: { accessToken: "dev" } },
    }));
  });
  const page = await ctx.newPage();

  page.on("console", (msg) => {
    var text = msg.text();
    if (text.includes("error") || text.includes("Error") || text.includes("ERR") || msg.type() === "error") {
      if (!text.includes("React DevTools") && !text.includes("[HMR]") && !text.includes("[Fast Refresh]")) {
        results.consoleErrors.push({ url: page.url(), type: msg.type(), text: text.substring(0, 200) });
      }
    }
  });

  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      results.networkErrors.push({ url: resp.url().substring(0, 100), status: resp.status() });
    }
  });

  // First load the main admin page
  console.log("Admin Home:");
  await page.goto("http://localhost:7400/admin", { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  var text = await page.evaluate(function () { return document.body.innerText; });
  var hasContent = text.length > 50;
  var hasError = text.indexOf("Error") !== -1 || text.indexOf("error") !== -1;
  var isLogin = text.indexOf("Sign in") !== -1;
  var status = isLogin ? "LOGIN_PAGE" : hasError ? "ERROR" : hasContent ? "OK" : "EMPTY";
  console.log("  " + status + " (len=" + text.length + ", snippet: " + text.substring(0, 100).replace(/\n/g, " ") + ")");
  results.pageResults["/admin"] = status;

  // Then each admin route
  for (var i = 0; i < ADMIN_ROUTES.length; i++) {
    var route = ADMIN_ROUTES[i];
    try {
      await page.goto("http://localhost:7400" + route.path, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(2500);

      text = await page.evaluate(function () { return document.body.innerText; });
      hasContent = text.length > 50;
      hasError = text.indexOf("Error") !== -1 || text.indexOf("not found") !== -1 || text.indexOf("Cannot GET") !== -1;
      isLogin = text.indexOf("Sign in") !== -1;

      var s = isLogin ? "LOGIN" : hasError ? "ERROR" : hasContent ? "OK" : "EMPTY";
      console.log(route.label + ": " + s + " (len=" + text.length + ")");
      results.pageResults[route.path] = s;

      // Click visible buttons on the page
      if (s === "OK") {
        try {
          var buttons = await page.$$("button, a");
          for (var b = 0; b < Math.min(buttons.length, 5); b++) {
            var vis = await buttons[b].isVisible().catch(function () { return false; });
            if (vis) { await buttons[b].click().catch(function () {}); await page.waitForTimeout(200); }
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log(route.label + ": FAIL (" + e.message.substring(0, 50) + ")");
      results.pageResults[route.path] = "FAIL";
    }
  }

  await ctx.close();
  await browser.close();

  console.log("\n========== ADMIN AUDIT REPORT ==========");
  console.log("Console errors: " + results.consoleErrors.length);
  for (var i = 0; i < results.consoleErrors.length; i++) {
    console.log("  [" + results.consoleErrors[i].type + "] " + results.consoleErrors[i].text.substring(0, 120));
  }

  console.log("\nNetwork errors: " + results.networkErrors.length);
  for (var i = 0; i < results.networkErrors.length; i++) {
    console.log("  " + results.networkErrors[i].status + " " + results.networkErrors[i].url);
  }

  console.log("\nPage results:");
  var ok = 0, err = 0, login = 0, fail = 0;
  for (var key in results.pageResults) {
    var s = results.pageResults[key];
    if (s === "OK") ok++;
    else if (s === "LOGIN" || s === "LOGIN_PAGE") { login++; console.log("  LOGIN: " + key); }
    else if (s === "ERROR") { err++; console.log("  ERROR: " + key); }
    else { fail++; console.log("  " + s + ": " + key); }
  }
  console.log("Admin: " + ok + " OK, " + login + " login page, " + err + " error, " + fail + " fail");
}

main().catch(function (e) { console.error("FATAL:", e.message); });
