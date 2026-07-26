# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\comprehensive-audit.spec.ts >> MeterVerse Comprehensive Audit >> 06 - Auth bypass protection
- Location: tests\comprehensive-audit.spec.ts:155:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "http://localhost:7400/"
Received: "http://localhost:7400/admin/users"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications alt+T"
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img [ref=e8]
            - generic [ref=e10]: MeterVerse
          - generic [ref=e11]: Admin
          - img [ref=e12]
          - generic [ref=e14]: home
        - generic [ref=e15]:
          - button "Toggle Inspector" [ref=e16]:
            - img [ref=e17]
          - button "Notifications" [ref=e19]:
            - img [ref=e20]
          - 'button "Theme: auto" [ref=e23]':
            - generic [ref=e24]: ⚙️
          - 'button "Language: EN" [ref=e25]':
            - generic [ref=e26]: EN
          - button "Admin User Administrator" [ref=e28]:
            - img [ref=e30]
            - generic [ref=e32]:
              - generic [ref=e33]: Admin User
              - generic [ref=e34]: Administrator
            - img [ref=e35]
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - button "Home" [ref=e40]:
              - img [ref=e41]
              - generic [ref=e43]: Home
            - button "Users" [ref=e44]:
              - img [ref=e45]
              - generic [ref=e47]: Users
            - button "Roles" [ref=e48]:
              - img [ref=e49]
              - generic [ref=e51]: Roles
            - button "Audit" [ref=e52]:
              - img [ref=e53]
              - generic [ref=e55]: Audit
            - button "Customers" [ref=e56]:
              - img [ref=e57]
              - generic [ref=e59]: Customers
            - button "Meters" [ref=e60]:
              - img [ref=e61]
              - generic [ref=e63]: Meters
            - button "Meter Relay" [ref=e64]:
              - img [ref=e65]
              - generic [ref=e67]: Meter Relay
            - button "Meter Assign" [ref=e68]:
              - img [ref=e69]
              - generic [ref=e71]: Meter Assign
            - button "Projects" [ref=e72]:
              - img [ref=e73]
              - generic [ref=e75]: Projects
            - button "Zones" [ref=e76]:
              - img [ref=e77]
              - generic [ref=e79]: Zones
            - button "Units" [ref=e80]:
              - img [ref=e81]
              - generic [ref=e83]: Units
            - button "Readings" [ref=e84]:
              - img [ref=e85]
              - generic [ref=e87]: Readings
            - button "Consumption" [ref=e88]:
              - img [ref=e89]
              - generic [ref=e91]: Consumption
            - button "Batch Valid." [ref=e92]:
              - img [ref=e93]
              - generic [ref=e95]: Batch Valid.
            - button "Invoices" [ref=e96]:
              - img [ref=e97]
              - generic [ref=e99]: Invoices
            - button "Payments" [ref=e100]:
              - img [ref=e101]
              - generic [ref=e103]: Payments
            - button "Tariffs" [ref=e104]:
              - img [ref=e105]
              - generic [ref=e107]: Tariffs
            - button "SIM Cards" [ref=e108]:
              - img [ref=e109]
              - generic [ref=e111]: SIM Cards
            - button "Settings" [ref=e112]:
              - img [ref=e113]
              - generic [ref=e115]: Settings
            - button "Reports" [ref=e116]:
              - img [ref=e117]
              - generic [ref=e119]: Reports
            - button "Services" [ref=e120]:
              - img [ref=e121]
              - generic [ref=e123]: Services
            - button "Security" [ref=e124]:
              - img [ref=e125]
              - generic [ref=e127]: Security
            - button "AI" [ref=e128]:
              - img [ref=e129]
              - generic [ref=e131]: AI
            - button "AI Cmd Center" [ref=e132]:
              - img [ref=e133]
              - generic [ref=e135]: AI Cmd Center
            - button "Monitor" [ref=e136]:
              - img [ref=e137]
              - generic [ref=e139]: Monitor
            - button "Config" [ref=e140]:
              - img [ref=e141]
              - generic [ref=e143]: Config
          - button [ref=e144]:
            - img [ref=e145]
        - generic [ref=e147]:
          - generic [ref=e149]:
            - generic [ref=e150]:
              - generic [ref=e151]:
                - heading "User Management" [level=1] [ref=e152]
                - paragraph [ref=e153]: Manage administrators and system users — 0 records
              - button "Add Management" [ref=e156]:
                - img
                - text: Add Management
            - generic [ref=e157]:
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - generic [ref=e161]: Total
                  - img [ref=e163]
                - generic [ref=e169]: "0"
              - generic [ref=e171]:
                - generic [ref=e172]:
                  - generic [ref=e173]: Active
                  - img [ref=e175]
                - generic [ref=e179]: "0"
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - generic [ref=e183]: Inactive
                  - img [ref=e185]
                - generic [ref=e189]: "0"
            - generic [ref=e190]:
              - tablist [ref=e192]:
                - tab "All" [selected] [ref=e193]
                - tab "Active (0)" [ref=e194]:
                  - text: Active
                  - generic [ref=e195]: (0)
                - tab "Inactive (0)" [ref=e196]:
                  - text: Inactive
                  - generic [ref=e197]: (0)
                - tab "Maintenance (0)" [ref=e198]:
                  - text: Maintenance
                  - generic [ref=e199]: (0)
                - tab "Terminated (0)" [ref=e200]:
                  - text: Terminated
                  - generic [ref=e201]: (0)
              - generic [ref=e202]:
                - img [ref=e203]
                - textbox "Search..." [ref=e206]
            - table [ref=e211]:
              - rowgroup [ref=e212]:
                - row "Name Email Role Status Last Active" [ref=e213]:
                  - columnheader "Name" [ref=e214]
                  - columnheader "Email" [ref=e215]
                  - columnheader "Role" [ref=e216]
                  - columnheader "Status" [ref=e217]
                  - columnheader "Last Active" [ref=e218]
                  - columnheader [ref=e219]
              - rowgroup [ref=e220]:
                - row "No records found." [ref=e221]:
                  - cell "No records found." [ref=e222]
          - generic [ref=e223]:
            - generic [ref=e224]: ●
            - generic [ref=e225]: All Systems Operational
            - generic [ref=e226]: "|"
            - generic [ref=e227]: 78 Models · 165 APIs · 42 Pages
            - generic [ref=e228]: Powering progress, one meter at a time
            - button "◀ Inspector" [ref=e229] [cursor=pointer]:
              - generic [ref=e230]: ◀
              - generic [ref=e231]: Inspector
  - alert [ref=e232]
```

# Test source

```ts
  67  |     response = await page.goto(url, { waitUntil: "load", timeout: 30000 })
  68  |   } catch (e: any) {
  69  |     result.errors.push(`NAVIGATION ERROR: ${e.message}`)
  70  |     results[name] = result
  71  |     return result
  72  |   }
  73  |   const loadTime = Date.now() - startTime
  74  | 
  75  |   result.status = response?.status() ?? 0
  76  |   result.perf = {
  77  |     domContentLoaded: await page.evaluate(() => performance.timing?.domContentLoadedEventEnd ?? 0),
  78  |     load: loadTime,
  79  |   }
  80  | 
  81  |   // Wait for any remaining network requests
  82  |   await page.waitForLoadState("networkidle").catch(() => {})
  83  |   await page.waitForTimeout(1000)
  84  | 
  85  |   // Count resources
  86  |   result.resourceCount = await page.evaluate(() => document.querySelectorAll("link[rel=stylesheet], script[src], img").length)
  87  | 
  88  |   // Check for accessibility issues
  89  |   const a11yIssues = await page.evaluate(() => {
  90  |     const issues: string[] = []
  91  |     document.querySelectorAll("img:not([alt])").forEach(() => issues.push("Image missing alt attribute"))
  92  |     document.querySelectorAll("button:not([aria-label]):not([title])").forEach((b) => {
  93  |       if (!b.textContent?.trim()) issues.push("Button without accessible label")
  94  |     })
  95  |     return issues
  96  |   })
  97  |   result.issues.push(...a11yIssues)
  98  | 
  99  |   // Check for React hydration errors
  100 |   const hydrationErrors = await page.evaluate(() => {
  101 |     const el = document.querySelector("[data-rr-ui-error], [data-nextjs-error]")
  102 |     return el ? "Hydration error detected" : null
  103 |   })
  104 |   if (hydrationErrors) result.issues.push(hydrationErrors)
  105 | 
  106 |   results[name] = result
  107 |   console.log(`  Status: ${result.status} | JS Errors: ${result.jsErrors} | Issues: ${result.issues.length} | Load: ${loadTime}ms`)
  108 |   return result
  109 | }
  110 | 
  111 | test.describe("MeterVerse Comprehensive Audit", () => {
  112 |   test("01 - Root workspace page", async ({ page }) => {
  113 |     const r = await auditPage(page, BASE + "/", "Root Workspace")
  114 |     expect(r.status).toBe(200)
  115 |   })
  116 | 
  117 |   test("02 - Login redirects to /", async ({ page }) => {
  118 |     await page.goto(BASE + "/login", { waitUntil: "load" })
  119 |     expect(page.url()).toBe(BASE + "/")
  120 |   })
  121 | 
  122 |   test("03 - App route redirects to /", async ({ page }) => {
  123 |     await page.goto(BASE + "/app/crm/customers", { waitUntil: "load" })
  124 |     expect(page.url()).toBe(BASE + "/")
  125 |   })
  126 | 
  127 |   test("04 - Workspace route redirects to /", async ({ page }) => {
  128 |     await page.goto(BASE + "/workspace", { waitUntil: "load" })
  129 |     expect(page.url()).toBe(BASE + "/")
  130 |   })
  131 | 
  132 |   test("05 - Sidebar navigation tabs", async ({ page }) => {
  133 |     await page.goto(BASE + "/", { waitUntil: "networkidle" })
  134 |     await page.waitForTimeout(2000)
  135 | 
  136 |     const sidebarButtons = await page.locator("nav button, [class*='sidebar'] button, [class*='Sidebar'] button").all()
  137 |     console.log(`  Found ${sidebarButtons.length} sidebar buttons`)
  138 | 
  139 |     // Try clicking each sidebar nav item
  140 |     const navItems = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
  141 |     for (const item of navItems) {
  142 |       try {
  143 |         const btn = page.locator(`button:has-text("${item}"), [class*="nav"]:has-text("${item}")`).first()
  144 |         if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
  145 |           await btn.click()
  146 |           await page.waitForTimeout(800)
  147 |           console.log(`  Clicked: ${item} ✓`)
  148 |         }
  149 |       } catch (e: any) {
  150 |         console.log(`  Could not click ${item}: ${e.message}`)
  151 |       }
  152 |     }
  153 |   })
  154 | 
  155 |   test("06 - Auth bypass protection", async ({ page }) => {
  156 |     const bypassUrls = [
  157 |       "/dashboard/overview",
  158 |       "/admin/users",
  159 |       "/settings",
  160 |       "/app/admin",
  161 |       "/dashboard",
  162 |       "/customer",
  163 |       "/app/developer",
  164 |     ]
  165 |     for (const url of bypassUrls) {
  166 |       await page.goto(BASE + url, { waitUntil: "load", timeout: 10000 })
> 167 |       expect(page.url()).toBe(BASE + "/")
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  168 |       console.log(`  ${url} → redirect to / ✓`)
  169 |     }
  170 |   })
  171 | 
  172 |   test("07 - Theme and visual identity", async ({ page }) => {
  173 |     await page.goto(BASE + "/", { waitUntil: "networkidle" })
  174 |     await page.waitForTimeout(1000)
  175 | 
  176 |     // Check design system tokens
  177 |     const hasCssVars = await page.evaluate(() => {
  178 |       const style = getComputedStyle(document.documentElement)
  179 |       return {
  180 |         hasBrand: style.getPropertyValue("--brand-primary") !== "",
  181 |         hasSurface: style.getPropertyValue("--surface-base") !== "",
  182 |         hasText: style.getPropertyValue("--text-primary") !== "",
  183 |         hasBorder: style.getPropertyValue("--border-default") !== "",
  184 |       }
  185 |     })
  186 |     console.log(`  CSS Variables:`, hasCssVars)
  187 |     expect(hasCssVars.hasBrand).toBeTruthy()
  188 | 
  189 |     // Check framer-motion animations
  190 |     const hasAnimations = await page.evaluate(() => {
  191 |       const els = document.querySelectorAll("[class*='motion'], [style*='transform'], [style*='animation']")
  192 |       return els.length > 0
  193 |     })
  194 |     console.log(`  Has animations: ${hasAnimations}`)
  195 |   })
  196 | 
  197 |   test("08 - Console error scan", async ({ page }) => {
  198 |     await page.goto(BASE + "/", { waitUntil: "load" })
  199 |     await page.waitForTimeout(3000)
  200 | 
  201 |     const consoleErrors: string[] = []
  202 |     page.on("console", (msg) => {
  203 |       if (msg.type() === "error") consoleErrors.push(msg.text())
  204 |     })
  205 | 
  206 |     // Navigate to all major sections
  207 |     const sections = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
  208 |     for (const section of sections) {
  209 |       try {
  210 |         const btn = page.locator(`button:has-text("${section}")`).first()
  211 |         if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
  212 |           await btn.click()
  213 |           await page.waitForTimeout(1500)
  214 |         }
  215 |       } catch {}
  216 |     }
  217 | 
  218 |     if (consoleErrors.length > 0) {
  219 |       console.log(`\n  ❌ CONSOLE ERRORS FOUND (${consoleErrors.length}):`)
  220 |       consoleErrors.forEach((e, i) => console.log(`    ${i + 1}. ${e}`))
  221 |     }
  222 |   })
  223 | 
  224 |   test("09 - Performance audit", async ({ page }) => {
  225 |     await page.goto(BASE + "/", { waitUntil: "load" })
  226 |     await page.waitForTimeout(2000)
  227 | 
  228 |     const perfData = await page.evaluate(() => ({
  229 |       domContentLoaded: performance.timing?.domContentLoadedEventEnd ?? 0,
  230 |       domInteractive: performance.timing?.domInteractive ?? 0,
  231 |       firstPaint: performance.getEntriesByType("paint").find(p => p.name === "first-paint")?.startTime ?? 0,
  232 |       firstContentfulPaint: performance.getEntriesByType("paint").find(p => p.name === "first-contentful-paint")?.startTime ?? 0,
  233 |       resources: performance.getEntriesByType("resource").length,
  234 |     }))
  235 |     console.log(`  Performance:`, perfData)
  236 |   })
  237 | 
  238 |   test("10 - Resource usage check", async ({ page }) => {
  239 |     await page.goto(BASE + "/", { waitUntil: "networkidle" })
  240 |     await page.waitForTimeout(2000)
  241 | 
  242 |     const resources = await page.evaluate(() => ({
  243 |       totalScripts: document.querySelectorAll("script[src]").length,
  244 |       totalStylesheets: document.querySelectorAll("link[rel=stylesheet]").length,
  245 |       totalImages: document.querySelectorAll("img").length,
  246 |       totalFonts: document.querySelectorAll("link[rel=preload][as=font]").length,
  247 |       totalIframes: document.querySelectorAll("iframe").length,
  248 |       domNodes: document.querySelectorAll("*").length,
  249 |     }))
  250 |     console.log(`  Resources:`, resources)
  251 |   })
  252 | })
  253 | 
  254 | test.describe("Backend API Health Check", () => {
  255 |   test("API is on different port (backend check)", async ({ request }) => {
  256 |     // Check if backend is running
  257 |     const resp = await request.get("http://localhost:3001/api/health").catch(() => null)
  258 |     if (resp) {
  259 |       console.log(`  Backend API: ${resp.status()}`)
  260 |     } else {
  261 |       console.log(`  Backend API: Not reachable (expected)`)
  262 |     }
  263 |   })
  264 | })
  265 | 
```