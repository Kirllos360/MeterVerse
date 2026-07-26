# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\admin-pages.spec.ts >> Page Error States >> invalid dashboard page returns 404
- Location: tests\admin-pages.spec.ts:62:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 200
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications alt+T"
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]:
            - img [ref=e9]
            - generic [ref=e11]: MeterVerse
          - generic [ref=e12]: Workspace
          - img [ref=e13]
          - generic [ref=e15]: October
        - generic [ref=e18]:
          - button "All" [ref=e20]:
            - text: All
            - img [ref=e21]
          - textbox "Search anything..." [ref=e23]
          - img [ref=e25]
        - generic [ref=e28]:
          - button "Hide Inspector" [ref=e29]:
            - img [ref=e30]
          - button "Notifications" [ref=e32]:
            - img [ref=e33]
          - button "Reminders" [ref=e36]:
            - img [ref=e37]
          - 'button "Mode: system" [ref=e40]':
            - generic [ref=e41]: ◐
          - 'button "Language: EN" [ref=e42]':
            - generic [ref=e43]: EN
          - button "User menu" [ref=e45]:
            - img [ref=e47]
            - generic [ref=e49]:
              - generic [ref=e50]: Admin User
              - generic [ref=e51]: Administrator
            - img [ref=e52]
      - generic [ref=e54]:
        - complementary [ref=e56]:
          - img [ref=e58]
          - navigation [ref=e61]:
            - generic [ref=e62]:
              - button "Executive section" [ref=e63]:
                - img [ref=e64]
                - generic [ref=e66]: Executive
                - generic [ref=e67]: "3"
              - generic [ref=e68]:
                - button "E Executive" [ref=e69]:
                  - generic [ref=e70]: E
                  - generic [ref=e71]: Executive
                - button "C CEO Dashboard" [ref=e72]:
                  - generic [ref=e73]: C
                  - generic [ref=e74]: CEO Dashboard
                - button "C Command Center" [ref=e75]:
                  - generic [ref=e76]: C
                  - generic [ref=e77]: Command Center
            - generic [ref=e78]:
              - button "CRM section" [ref=e79]:
                - img [ref=e80]
                - generic [ref=e82]: CRM
                - generic [ref=e83]: "4"
              - generic [ref=e84]:
                - button "C Customers" [ref=e85]:
                  - generic [ref=e86]: C
                  - generic [ref=e87]: Customers
                - button "C Customer Groups" [ref=e88]:
                  - generic [ref=e89]: C
                  - generic [ref=e90]: Customer Groups
                - button "C Contacts" [ref=e91]:
                  - generic [ref=e92]: C
                  - generic [ref=e93]: Contacts
                - button "C Contracts" [ref=e94]:
                  - generic [ref=e95]: C
                  - generic [ref=e96]: Contracts
            - generic [ref=e97]:
              - button "Billing section" [ref=e98]:
                - img [ref=e99]
                - generic [ref=e101]: Billing
                - generic [ref=e102]: "5"
              - generic [ref=e103]:
                - button "I Invoices 12" [ref=e104]:
                  - generic [ref=e105]: I
                  - generic [ref=e106]:
                    - text: Invoices
                    - generic [ref=e107]: "12"
                - button "I Invoice Generator" [ref=e108]:
                  - generic [ref=e109]: I
                  - generic [ref=e110]: Invoice Generator
                - button "P Payments" [ref=e111]:
                  - generic [ref=e112]: P
                  - generic [ref=e113]: Payments
                - button "C Credit Notes" [ref=e114]:
                  - generic [ref=e115]: C
                  - generic [ref=e116]: Credit Notes
                - button "T Tariffs" [ref=e117]:
                  - generic [ref=e118]: T
                  - generic [ref=e119]: Tariffs
            - generic [ref=e120]:
              - button "Meters section" [ref=e121]:
                - img [ref=e122]
                - generic [ref=e124]: Meters
                - generic [ref=e125]: "4"
              - generic [ref=e126]:
                - button "M Meters" [ref=e127]:
                  - generic [ref=e128]: M
                  - generic [ref=e129]: Meters
                - button "M Meter Types" [ref=e130]:
                  - generic [ref=e131]: M
                  - generic [ref=e132]: Meter Types
                - button "M Meter Map BETA" [ref=e133]:
                  - generic [ref=e134]: M
                  - generic [ref=e135]:
                    - text: Meter Map
                    - generic [ref=e136]: BETA
                - button "S SIM Cards" [ref=e137]:
                  - generic [ref=e138]: S
                  - generic [ref=e139]: SIM Cards
            - generic [ref=e140]:
              - button "Readings section" [ref=e141]:
                - img [ref=e142]
                - generic [ref=e144]: Readings
                - generic [ref=e145]: "3"
              - generic [ref=e146]:
                - button "R Readings" [ref=e147]:
                  - generic [ref=e148]: R
                  - generic [ref=e149]: Readings
                - button "M Manual Reading" [ref=e150]:
                  - generic [ref=e151]: M
                  - generic [ref=e152]: Manual Reading
                - button "B Bulk Import" [ref=e153]:
                  - generic [ref=e154]: B
                  - generic [ref=e155]: Bulk Import
            - generic [ref=e156]:
              - button "Operations section" [ref=e157]:
                - img [ref=e158]
                - generic [ref=e160]: Operations
                - generic [ref=e161]: "2"
              - generic [ref=e162]:
                - button "O Operations" [ref=e163]:
                  - generic [ref=e164]: O
                  - generic [ref=e165]: Operations
                - button "W Work Orders" [ref=e166]:
                  - generic [ref=e167]: W
                  - generic [ref=e168]: Work Orders
            - generic [ref=e169]:
              - button "Finance section" [ref=e170]:
                - img [ref=e171]
                - generic [ref=e173]: Finance
                - generic [ref=e174]: "3"
              - generic [ref=e175]:
                - button "F Financial" [ref=e176]:
                  - generic [ref=e177]: F
                  - generic [ref=e178]: Financial
                - button "R Revenue" [ref=e179]:
                  - generic [ref=e180]: R
                  - generic [ref=e181]: Revenue
                - button "C Cash Flow" [ref=e182]:
                  - generic [ref=e183]: C
                  - generic [ref=e184]: Cash Flow
            - generic [ref=e185]:
              - button "Reports section" [ref=e186]:
                - img [ref=e187]
                - generic [ref=e189]: Reports
                - generic [ref=e190]: "3"
              - generic [ref=e191]:
                - button "R Reports" [ref=e192]:
                  - generic [ref=e193]: R
                  - generic [ref=e194]: Reports
                - button "F Financial Reports" [ref=e195]:
                  - generic [ref=e196]: F
                  - generic [ref=e197]: Financial Reports
                - button "C Consumption Reports" [ref=e198]:
                  - generic [ref=e199]: C
                  - generic [ref=e200]: Consumption Reports
            - generic [ref=e201]:
              - button "Monitoring section" [ref=e202]:
                - img [ref=e203]
                - generic [ref=e205]: Monitoring
                - generic [ref=e206]: "2"
              - generic [ref=e207]:
                - button "M Monitoring" [ref=e208]:
                  - generic [ref=e209]: M
                  - generic [ref=e210]: Monitoring
                - button "A Alerts 7" [ref=e211]:
                  - generic [ref=e212]: A
                  - generic [ref=e213]:
                    - text: Alerts
                    - generic [ref=e214]: "7"
            - generic [ref=e215]:
              - button "IoT section" [ref=e216]:
                - img [ref=e217]
                - generic [ref=e219]: IoT
                - generic [ref=e220]: "1"
              - button "I IoT Devices" [ref=e222]:
                - generic [ref=e223]: I
                - generic [ref=e224]: IoT Devices
            - generic [ref=e225]:
              - button "Administration section" [ref=e226]:
                - img [ref=e227]
                - generic [ref=e229]: Administration
                - generic [ref=e230]: "4"
              - generic [ref=e231]:
                - button "A Administration" [ref=e232]:
                  - generic [ref=e233]: A
                  - generic [ref=e234]: Administration
                - button "U Users" [ref=e235]:
                  - generic [ref=e236]: U
                  - generic [ref=e237]: Users
                - button "R Roles & Permissions" [ref=e238]:
                  - generic [ref=e239]: R
                  - generic [ref=e240]: Roles & Permissions
                - button "A Audit Logs" [ref=e241]:
                  - generic [ref=e242]: A
                  - generic [ref=e243]: Audit Logs
            - generic [ref=e244]:
              - button "Security section" [ref=e245]:
                - img [ref=e246]
                - generic [ref=e248]: Security
                - generic [ref=e249]: "3"
              - generic [ref=e250]:
                - button "S Security" [ref=e251]:
                  - generic [ref=e252]: S
                  - generic [ref=e253]: Security
                - button "A Authentication" [ref=e254]:
                  - generic [ref=e255]: A
                  - generic [ref=e256]: Authentication
                - button "A API Tokens" [ref=e257]:
                  - generic [ref=e258]: A
                  - generic [ref=e259]: API Tokens
            - generic [ref=e260]:
              - button "AI Center section" [ref=e261]:
                - img [ref=e262]
                - generic [ref=e264]: AI Center
                - generic [ref=e265]: "3"
              - generic [ref=e266]:
                - button "A AI Center 3" [ref=e267]:
                  - generic [ref=e268]: A
                  - generic [ref=e269]:
                    - text: AI Center
                    - generic [ref=e270]: "3"
                - button "A AI Assistant" [ref=e271]:
                  - generic [ref=e272]: A
                  - generic [ref=e273]: AI Assistant
                - button "A AI Insights BETA" [ref=e274]:
                  - generic [ref=e275]: A
                  - generic [ref=e276]:
                    - text: AI Insights
                    - generic [ref=e277]: BETA
            - generic [ref=e278]:
              - button "Settings section" [ref=e279]:
                - img [ref=e280]
                - generic [ref=e282]: Settings
                - generic [ref=e283]: "3"
              - generic [ref=e284]:
                - button "S Settings" [ref=e285]:
                  - generic [ref=e286]: S
                  - generic [ref=e287]: Settings
                - button "S System Configuration" [ref=e288]:
                  - generic [ref=e289]: S
                  - generic [ref=e290]: System Configuration
                - button "B Backups" [ref=e291]:
                  - generic [ref=e292]: B
                  - generic [ref=e293]: Backups
            - generic [ref=e294]:
              - button "Developer section" [ref=e295]:
                - img [ref=e296]
                - generic [ref=e298]: Developer
                - generic [ref=e299]: "4"
              - generic [ref=e300]:
                - button "D Developer" [ref=e301]:
                  - generic [ref=e302]: D
                  - generic [ref=e303]: Developer
                - button "A API Explorer" [ref=e304]:
                  - generic [ref=e305]: A
                  - generic [ref=e306]: API Explorer
                - button "R Runtime Inspector" [ref=e307]:
                  - generic [ref=e308]: R
                  - generic [ref=e309]: Runtime Inspector
                - button "L Logs" [ref=e310]:
                  - generic [ref=e311]: L
                  - generic [ref=e312]: Logs
          - button "Collapse sidebar" [ref=e314]:
            - img [ref=e315]
            - generic [ref=e317]: Collapse sidebar
        - generic [ref=e318]:
          - tab "Welcome" [selected] [ref=e321] [cursor=pointer]:
            - generic [ref=e323]: Welcome
            - img [ref=e324]
          - generic [ref=e327]:
            - generic [ref=e329]:
              - heading "Dashboard" [level=1] [ref=e330]
              - paragraph [ref=e331]: October — All systems operational
            - generic [ref=e332]:
              - generic [ref=e334]: Executive Summary
              - generic [ref=e336]:
                - generic [ref=e337]:
                  - generic [ref=e338]: Active Meters
                  - generic [ref=e339]: 2,847
                - generic [ref=e340]:
                  - generic [ref=e341]: Pending Invoices
                  - generic [ref=e342]: "193"
                - generic [ref=e343]:
                  - generic [ref=e344]: Collection Rate
                  - generic [ref=e345]: 94%
                - generic [ref=e346]:
                  - generic [ref=e347]: System Health
                  - generic [ref=e348]: 98%
                - generic [ref=e349]:
                  - generic [ref=e350]: Revenue (MTD)
                  - generic [ref=e351]: $2.4M
                - generic [ref=e352]:
                  - generic [ref=e353]: Avg Response
                  - generic [ref=e354]: 1.8s
                - generic [ref=e355]:
                  - generic [ref=e356]: Active Customers
                  - generic [ref=e357]: 1,523
                - generic [ref=e358]:
                  - generic [ref=e359]: Total Meters
                  - generic [ref=e360]: 3,050
            - generic [ref=e361]:
              - generic [ref=e363]: System Analysis (12 Views)
              - generic [ref=e365]:
                - generic [ref=e366]:
                  - generic [ref=e368]: Meters Online/Offline
                  - paragraph [ref=e378]: 2,847 Active / 203 Offline
                - generic [ref=e379]:
                  - generic [ref=e381]: Invoice Status
                  - paragraph [ref=e391]: 193 Pending / 1,204 Paid / 47 Overdue
                - generic [ref=e392]:
                  - generic [ref=e394]: Payment Methods
                  - paragraph [ref=e404]: Bank 62% / Cash 23% / Card 15%
                - generic [ref=e405]:
                  - generic [ref=e407]: Monthly Collection
                  - paragraph [ref=e417]: Jan $1.8M / Feb $2.1M / Mar $1.9M
                - generic [ref=e418]:
                  - generic [ref=e420]: Meter Types
                  - paragraph [ref=e430]: Electric 55% / Water 30% / Gas 15%
                - generic [ref=e431]:
                  - generic [ref=e433]: Regional Distribution
                  - paragraph [ref=e443]: October 42% / New Cairo 33% / SODIC 25%
                - generic [ref=e444]:
                  - generic [ref=e446]: Consumption Trends
                  - paragraph [ref=e455]: +12.4% vs last month
                - generic [ref=e456]:
                  - generic [ref=e458]: Alerts by Severity
                  - paragraph [ref=e467]: Critical 3 / Warning 12 / Info 47
                - generic [ref=e468]:
                  - generic [ref=e470]: Revenue Breakdown
                  - paragraph [ref=e478]: Residential 58% / Commercial 32% / Industrial 10%
                - generic [ref=e479]:
                  - generic [ref=e481]: Task Completion
                  - paragraph [ref=e488]: Billing 92% / Maintenance 78% / Inspections 85%
                - generic [ref=e489]:
                  - generic [ref=e491]: Customer Growth
                  - paragraph [ref=e497]: +5.2% this quarter
                - generic [ref=e498]:
                  - generic [ref=e500]: System Performance
                  - paragraph [ref=e506]: 99.97% uptime / 1.8s avg
            - generic [ref=e507]:
              - generic [ref=e508]:
                - generic [ref=e509]:
                  - generic [ref=e510]: Top Debt Customers
                  - textbox "Search customers..." [ref=e511]
                - generic [ref=e512]:
                  - generic [ref=e513]:
                    - generic [ref=e514]: Palm Hills Development
                    - generic [ref=e515]:
                      - generic [ref=e516]: $24,500
                      - generic [ref=e517]: 65 days overdue
                  - generic [ref=e518]:
                    - generic [ref=e519]: Omar Corp
                    - generic [ref=e520]:
                      - generic [ref=e521]: $18,200
                      - generic [ref=e522]: 42 days overdue
                  - generic [ref=e523]:
                    - generic [ref=e524]: Ahmed Hassan
                    - generic [ref=e525]:
                      - generic [ref=e526]: $3,450
                      - generic [ref=e527]: 28 days overdue
              - generic [ref=e528]:
                - text: Quick Actions
                - generic [ref=e529]:
                  - button "+ New Invoice" [ref=e530]:
                    - generic [ref=e531]: +
                    - text: New Invoice
                  - button "+ Add Meter" [ref=e532]:
                    - generic [ref=e533]: +
                    - text: Add Meter
                  - button "+ Record Reading" [ref=e534]:
                    - generic [ref=e535]: +
                    - text: Record Reading
                  - button "+ Generate Report" [ref=e536]:
                    - generic [ref=e537]: +
                    - text: Generate Report
            - generic [ref=e538]:
              - generic [ref=e540]: Applications
              - generic [ref=e542]:
                - button "E Executive" [ref=e543]:
                  - generic [ref=e544]: E
                  - generic [ref=e545]: Executive
                - button "C CEO Dashboard" [ref=e546]:
                  - generic [ref=e547]: C
                  - generic [ref=e548]: CEO Dashboard
                - button "C Command Center" [ref=e549]:
                  - generic [ref=e550]: C
                  - generic [ref=e551]: Command Center
                - button "C Customers" [ref=e552]:
                  - generic [ref=e553]: C
                  - generic [ref=e554]: Customers
                - button "C Customer Groups" [ref=e555]:
                  - generic [ref=e556]: C
                  - generic [ref=e557]: Customer Groups
                - button "C Contacts" [ref=e558]:
                  - generic [ref=e559]: C
                  - generic [ref=e560]: Contacts
                - button "C Contracts" [ref=e561]:
                  - generic [ref=e562]: C
                  - generic [ref=e563]: Contracts
                - button "I Invoices" [ref=e564]:
                  - generic [ref=e565]: I
                  - generic [ref=e566]: Invoices
        - generic [ref=e569]:
          - generic [ref=e570]:
            - generic [ref=e571]:
              - generic [ref=e572]:
                - img [ref=e573]
                - generic [ref=e575]: Inspector
              - button "Close inspector" [ref=e576]:
                - img [ref=e577]
            - generic [ref=e579]:
              - button "Properties" [ref=e580]
              - button "Activity" [ref=e581]
          - paragraph [ref=e585]: Select an item to inspect
          - generic [ref=e586]:
            - button "meter" [ref=e587]
            - button "customer" [ref=e588]
            - button "invoice" [ref=e589]
            - button "payment" [ref=e590]
            - button "reading" [ref=e591]
            - button "none" [ref=e592]
          - button "Collapse" [ref=e594]:
            - img [ref=e595]
            - generic [ref=e597]: Collapse
      - contentinfo [ref=e599]:
        - generic [ref=e600]:
          - generic [ref=e601]:
            - generic [ref=e603]: API
            - generic [ref=e604]: 12ms
          - generic [ref=e606]: ⚡ Powering progress, one meter at a time
        - generic [ref=e607]:
          - generic [ref=e608]: October
          - generic [ref=e609]: EN
          - generic [ref=e610]: v8.0.0
  - alert [ref=e611]
```

# Test source

```ts
  1  | import { test, expect, type Page } from "@playwright/test"
  2  | 
  3  | const BASE = process.env.BASE_URL || "http://localhost:7400"
  4  | 
  5  | async function navigateTo(page: Page, path: string) {
  6  |   const response = await page.goto(`${BASE}${path}`)
  7  |   return response
  8  | }
  9  | 
  10 | test.describe("Admin List Pages", () => {
  11 | 
  12 |   const adminPages = [
  13 |     { path: "/admin/customers", name: "Customers" },
  14 |     { path: "/admin/meters", name: "Meters" },
  15 |     { path: "/admin/readings", name: "Readings" },
  16 |     { path: "/admin/invoices", name: "Invoices" },
  17 |     { path: "/admin/payments", name: "Payments" },
  18 |     { path: "/admin/users", name: "Users" },
  19 |     { path: "/admin/roles", name: "Roles" },
  20 |     { path: "/admin/areas", name: "Areas" },
  21 |     { path: "/admin/reports", name: "Reports" },
  22 |     { path: "/admin/audit", name: "Audit" },
  23 |     { path: "/admin/settings", name: "Settings" },
  24 |   ]
  25 | 
  26 |   for (const { path, name } of adminPages) {
  27 |     test(`admin ${name} page renders`, async ({ page }) => {
  28 |       const response = await navigateTo(page, path)
  29 |       expect(response?.status()).toBe(200)
  30 |       await expect(page.locator("body")).toBeVisible()
  31 |     })
  32 |   }
  33 | })
  34 | 
  35 | test.describe("Dashboard Pages", () => {
  36 | 
  37 |   const dashboardPages = [
  38 |     { path: "/dashboard/overview", name: "Overview" },
  39 |     { path: "/dashboard/meters", name: "Meters" },
  40 |     { path: "/dashboard/readings", name: "Readings" },
  41 |     { path: "/dashboard/customers", name: "Customers" },
  42 |     { path: "/dashboard/users", name: "Users" },
  43 |     { path: "/dashboard/invoices", name: "Invoices" },
  44 |   ]
  45 | 
  46 |   for (const { path, name } of dashboardPages) {
  47 |     test(`dashboard ${name} page renders`, async ({ page }) => {
  48 |       const response = await navigateTo(page, path)
  49 |       expect(response?.status()).toBe(200)
  50 |       await expect(page.locator("body")).toBeVisible()
  51 |     })
  52 |   }
  53 | })
  54 | 
  55 | test.describe("Page Error States", () => {
  56 | 
  57 |   test("invalid admin page returns 404", async ({ page }) => {
  58 |     const response = await navigateTo(page, "/admin/nonexistent-page")
  59 |     expect(response?.status()).toBe(404)
  60 |   })
  61 | 
  62 |   test("invalid dashboard page returns 404", async ({ page }) => {
  63 |     const response = await navigateTo(page, "/dashboard/nonexistent")
> 64 |     expect(response?.status()).toBe(404)
     |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  65 |   })
  66 | })
  67 | 
  68 | test.describe("Page Load Performance", () => {
  69 | 
  70 |   const perfPages = [
  71 |     "/admin/customers",
  72 |     "/admin/meters",
  73 |     "/admin/invoices",
  74 |     "/admin/dashboard",
  75 |   ]
  76 | 
  77 |   for (const path of perfPages) {
  78 |     test(`page ${path} loads without console errors`, async ({ page }) => {
  79 |       const errors: string[] = []
  80 |       page.on("console", (msg) => {
  81 |         if (msg.type() === "error") errors.push(msg.text())
  82 |       })
  83 |       await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  84 |       const criticalErrors = errors.filter(e =>
  85 |         !e.includes("favicon") &&
  86 |         !e.includes("third-party") &&
  87 |         !e.includes("chrome-extension")
  88 |       )
  89 |       expect(criticalErrors).toHaveLength(0)
  90 |     })
  91 |   }
  92 | })
  93 | 
```