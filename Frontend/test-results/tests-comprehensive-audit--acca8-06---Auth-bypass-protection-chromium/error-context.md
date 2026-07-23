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
    - generic [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]:
            - img [ref=e10]
            - generic [ref=e12]: MeterVerse
          - generic [ref=e13]: Admin
          - img [ref=e14]
          - generic [ref=e16]: home
        - generic [ref=e17]:
          - button "Toggle Inspector" [ref=e18]:
            - img [ref=e19]
          - button "Notifications" [ref=e21]:
            - img [ref=e22]
          - 'button "Theme: auto" [ref=e25]':
            - generic [ref=e26]: ⚙️
          - 'button "Language: EN" [ref=e27]':
            - generic [ref=e28]: EN
          - button "Admin User Administrator" [ref=e30]:
            - img [ref=e32]
            - generic [ref=e34]:
              - generic [ref=e35]: Admin User
              - generic [ref=e36]: Administrator
            - img [ref=e37]
      - generic [ref=e39]:
        - generic [ref=e41]:
          - generic [ref=e42]:
            - button "Home" [ref=e43] [cursor=pointer]:
              - img [ref=e44]
              - generic [ref=e46]: Home
            - button "Users" [ref=e47] [cursor=pointer]:
              - img [ref=e48]
              - generic [ref=e50]: Users
            - button "Roles" [ref=e51] [cursor=pointer]:
              - img [ref=e52]
              - generic [ref=e54]: Roles
            - button "Audit" [ref=e55] [cursor=pointer]:
              - img [ref=e56]
              - generic [ref=e58]: Audit
            - button "Customers" [ref=e59] [cursor=pointer]:
              - img [ref=e60]
              - generic [ref=e62]: Customers
            - button "Settings" [ref=e63] [cursor=pointer]:
              - img [ref=e64]
              - generic [ref=e66]: Settings
            - button "Reports" [ref=e67] [cursor=pointer]:
              - img [ref=e68]
              - generic [ref=e70]: Reports
            - button "Services" [ref=e71] [cursor=pointer]:
              - img [ref=e72]
              - generic [ref=e74]: Services
            - button "Security" [ref=e75] [cursor=pointer]:
              - img [ref=e76]
              - generic [ref=e78]: Security
            - button "AI" [ref=e79] [cursor=pointer]:
              - img [ref=e80]
              - generic [ref=e82]: AI
            - button "Monitor" [ref=e83] [cursor=pointer]:
              - img [ref=e84]
              - generic [ref=e86]: Monitor
          - button [ref=e87] [cursor=pointer]:
            - img [ref=e89]
        - generic [ref=e91]:
          - tab "Welcome" [selected] [ref=e94] [cursor=pointer]:
            - generic [ref=e96]: Welcome
            - img [ref=e97]
          - generic [ref=e100]:
            - generic [ref=e101]:
              - textbox "Search admin..." [ref=e102]
              - button "List" [ref=e103]
              - button "Grid" [ref=e104]
            - generic [ref=e105]:
              - generic [ref=e106]:
                - heading "Admin Dashboard" [level=1] [ref=e107]
                - paragraph [ref=e108]: MeterVerse Enterprise Administration
              - generic [ref=e109]:
                - generic [ref=e110]:
                  - generic [ref=e111]:
                    - generic [ref=e112]: Total Users
                    - img [ref=e114]
                  - generic [ref=e116]: —
                - generic [ref=e117]:
                  - generic [ref=e118]:
                    - generic [ref=e119]: Active Sessions
                    - img [ref=e121]
                  - generic [ref=e123]: —
                - generic [ref=e124]:
                  - generic [ref=e125]:
                    - generic [ref=e126]: System Health
                    - img [ref=e128]
                  - generic [ref=e130]: ok
                - generic [ref=e131]:
                  - generic [ref=e132]:
                    - generic [ref=e133]: Services
                    - img [ref=e135]
                  - generic [ref=e137]: 15 active
              - generic [ref=e138]:
                - generic [ref=e139]:
                  - heading "Quick Access" [level=2] [ref=e140]
                  - generic [ref=e141]:
                    - link "👥 Users Manage administrators" [ref=e142] [cursor=pointer]:
                      - /url: /admin/users
                      - generic [ref=e143]: 👥
                      - generic [ref=e144]: Users
                      - generic [ref=e145]: Manage administrators
                    - link "🛡️ Security Security audit & compliance" [ref=e146] [cursor=pointer]:
                      - /url: /admin/security
                      - generic [ref=e147]: 🛡️
                      - generic [ref=e148]: Security
                      - generic [ref=e149]: Security audit & compliance
                    - link "📊 Reports Analytics & reporting" [ref=e150] [cursor=pointer]:
                      - /url: /admin/reports
                      - generic [ref=e151]: 📊
                      - generic [ref=e152]: Reports
                      - generic [ref=e153]: Analytics & reporting
                    - link "🤖 AI AI agents & automation" [ref=e154] [cursor=pointer]:
                      - /url: /admin/ai
                      - generic [ref=e155]: 🤖
                      - generic [ref=e156]: AI
                      - generic [ref=e157]: AI agents & automation
                    - link "📋 Audit System audit trail" [ref=e158] [cursor=pointer]:
                      - /url: /admin/audit
                      - generic [ref=e159]: 📋
                      - generic [ref=e160]: Audit
                      - generic [ref=e161]: System audit trail
                    - link "📈 Monitor Performance metrics" [ref=e162] [cursor=pointer]:
                      - /url: /admin/monitoring
                      - generic [ref=e163]: 📈
                      - generic [ref=e164]: Monitor
                      - generic [ref=e165]: Performance metrics
                    - link "⚙️ Settings System configuration" [ref=e166] [cursor=pointer]:
                      - /url: /admin/settings
                      - generic [ref=e167]: ⚙️
                      - generic [ref=e168]: Settings
                      - generic [ref=e169]: System configuration
                    - link "🧩 Services Platform services" [ref=e170] [cursor=pointer]:
                      - /url: /admin/services
                      - generic [ref=e171]: 🧩
                      - generic [ref=e172]: Services
                      - generic [ref=e173]: Platform services
                - generic [ref=e174]:
                  - heading "Recent Activity" [level=2] [ref=e175]
                  - generic [ref=e176]:
                    - generic [ref=e177]:
                      - generic [ref=e179]: System health check passed
                      - generic [ref=e180]: 2m ago
                    - generic [ref=e181]:
                      - generic [ref=e183]: Backup completed
                      - generic [ref=e184]: 15m ago
                    - generic [ref=e185]:
                      - generic [ref=e187]: New user registered
                      - generic [ref=e188]: 1h ago
                    - generic [ref=e189]:
                      - generic [ref=e191]: "Invoice #INV-0042 generated"
                      - generic [ref=e192]: 2h ago
                    - generic [ref=e193]:
                      - generic [ref=e195]: Meter reading anomaly flagged
                      - generic [ref=e196]: 3h ago
              - generic [ref=e197]:
                - generic [ref=e198]: v8.0.0
                - generic [ref=e199]: •
                - generic [ref=e200]: 78 Prisma Models
                - generic [ref=e201]: •
                - generic [ref=e202]: 165 API Endpoints
                - generic [ref=e203]: •
                - generic [ref=e204]: 42 Admin Pages
                - generic [ref=e205]: •
                - generic [ref=e206]: 9 AI Agents
                - generic [ref=e207]: ● All Systems Operational
      - generic [ref=e211]:
        - generic [ref=e212]: ●
        - generic [ref=e213]: All Systems Operational
        - generic [ref=e214]: "|"
        - generic [ref=e215]: 78 Models · 165 APIs · 42 Pages
        - generic [ref=e216]: Powering progress, one meter at a time
        - button "◀ Inspector" [ref=e217] [cursor=pointer]:
          - generic [ref=e218]: ◀
          - generic [ref=e219]: Inspector
  - alert [ref=e220]
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