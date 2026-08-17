# MeterVerse Solar Invoice — Owner Demonstration Script (3–5 minutes)

Follow these steps in order. No technical assistance needed.

**URLS (all verified HTTP 200 + browser-rendered, 2026-08-17):**
- Admin console: **http://localhost:3535** (LAN: http://192.168.1.2:3535)
- Customer portal: **http://localhost:3030** (LAN: http://192.168.1.2:3030)
- Admin API: http://localhost:3131/api · Portal API: http://localhost:3003/api

**If a service is not running, start it (from the repo `_tools/` or via scheduled task):**
- Admin BE: `schtasks /Run /TN "MeterVerseAdminBE"` (or `_tools/start-admin-be.cmd`)
- Admin FE: `_tools/start-admin-fe.cmd`
- Portal BE: `_tools/start-portal-be.cmd`
- Portal FE: `_tools/start-portal-fe.cmd` (or `next dev -p 3030` in `Frontend/` with PORTAL_MODE=1)

---

**STEP 1 — Open the system.**
Open a browser and go to **http://localhost:3535** (Admin console).

**STEP 2 — Log in.**
Email: `admin@meterverse.com` · Password: `Admin@123`

**STEP 3 — Open the customer.**
From the menu go to **Customers**, search for **شافعي** (or "Ihab Shafie").

**STEP 4 — Show the customer / unit.**
The customer record shows name, status **active**, and their meter.

**STEP 5 — Show the solar meter 52051449.**
From **Meters**, search **52051449**. It is type **solar** and linked to this customer.

**STEP 6 — Show the assignment.**
The meter has an **active MeterAssignment** linking it to the customer (since 2021-01-01). This is the meter→customer relationship.

**STEP 7 — Show the invoice.**
From **Invoices**, open invoice **SOLAR-52051449-2021-01**.

**STEP 8 — Show the amount.**
The invoice amount is **36.10 EGP**, status **issued**.

**STEP 9 — Open / generate the PDF.**
Use the invoice's PDF action. The system generates a real PDF: `backend/pdf-output/invoice-SOLAR-52051449-2021-01.pdf` (23,649 bytes) containing the amount, invoice number, customer name (Arabic), and amount-in-words "thirty six EGP".

**STEP 10 — Explain the tariff.**
"This meter is solar. It uses the Collection-verified solar tariff: 12 tiers from 0.48 to 1.58 EGP/kWh, plus 2% admin fee and a 9.10 EGP service fee."

**STEP 11 — Explain reading → meter linkage.**
"Every reading is stored with the meter's unique ID. A reading belongs to meter 52051449 because its row stores that meter's ID. The meter is found by serial 52051449."

**STEP 12 — Explain the calculation.**
"Consumption = current import register − previous import register. The tariff turns kWh into money; + 2% admin + 9.10 service = the invoice total. For this customer the January 2021 bill was the solar minimum charge of 36.10 EGP."

---

**Alternative customer-facing view:** open **http://localhost:3030** (Customer Portal) to show the same customer/meter/invoice from the portal side.

**If asked "what's the raw register?":** the raw 180/280 register numbers are currently **UNKNOWN** (not present in any accessible copy and no live Collection source reachable). Everything else — customer, meter, invoices, PDF — is **REAL**.
