const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  // Step 1: Go to admin page
  console.log("=== STEP 1: http://localhost:7400/admin ===");
  await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  
  // Get ALL text content
  let text = await page.evaluate(() => document.body.innerText);
  console.log(text.slice(0, 2000));
  console.log("...");

  // Step 2: Click "Customers" in sidebar
  console.log("\n=== STEP 2: Click Customers ===");
  const custLink = await page.$('a[href*="customers"], button:has-text("Customers"), [id="customers"]');
  if (custLink) {
    await custLink.click();
    await page.waitForTimeout(3000);
    text = await page.evaluate(() => document.body.innerText);
    console.log(text.slice(0, 1500));
  } else {
    console.log("No Customers link found. Sidebar content:");
    const links = await page.evaluate(() => 
      Array.from(document.querySelectorAll("a, button, [role='button']"))
        .filter(el => el.textContent.trim())
        .map(el => el.textContent.trim())
        .slice(0, 30)
    );
    console.log(links.join("\n"));
  }

  // Step 3: Try clicking "Add" to see form
  console.log("\n=== STEP 3: Look for Add/New button ===");
  const addBtn = await page.$('button:has-text("Add"), button:has-text("New"), a:has-text("Add"), a:has-text("New")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    text = await page.evaluate(() => document.body.innerText);
    console.log(text.slice(0, 1500));
  } else {
    console.log("No Add button visible. Page content:");
    text = await page.evaluate(() => document.body.innerText);
    console.log(text.slice(0, 1000));
  }

  // Step 4: Check what happens on dashboard
  console.log("\n=== STEP 4: Dashboard ===");
  await page.goto("http://localhost:7400/dashboard/overview", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  text = await page.evaluate(() => document.body.innerText);
  console.log(text.slice(0, 1500));

  await browser.close();
  console.log("\nDone browsing.");
})();
