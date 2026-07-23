import { readFileSync, writeFileSync, readdirSync } from 'fs';

const KB_DIR = 'D:/meter/planning/000_ENTERPRISE_PROGRAM/31_ENTERPRISE_KNOWLEDGE_BASE';
const SCHEMA_PATH = 'D:/meter/backend/prisma/schema.prisma';
const EXCEL_ANALYSIS = 'D:/meter/docs/EXCEL_BUSINESS_ANALYSIS.md';

const schema = readFileSync(SCHEMA_PATH, 'utf8');
const excelAnalysis = readFileSync(EXCEL_ANALYSIS, 'utf8');

// Extract all model names from schema
const models = [...schema.matchAll(/model (\w+) \{/g)].map(m => m[1]);

// ═══ 01_Company_Profile.md ═══
writeFileSync(KB_DIR + '/01_Company_Profile.md', `# Company Profile

## Current Knowledge
- Property management / utility billing company managing multiple residential communities
- Areas managed: Golf Extension, October, Palm Central, The Crown
- Customers include villa owners and commercial units
- Languages used: Arabic (primary), English

## Unknown
- Legal company name
- Year founded
- Number of employees
- Current software/tools used besides Excel and SYMBIOT

## Assumptions
- Company operates in Egypt (EGP currency, Egyptian regulations)
- Managing utilities as a third-party service provider

## Confidence
- Company scope: 80% (from Excel data)
- Location: 70% (from currency and Arabic names)
- Exact legal structure: Unknown

## Need User Confirmation
- [ ] Confirm legal company name and registration
- [ ] Confirm country and primary currency
- [ ] Confirm if they are the utility provider or a management company
`);

// ═══ 03_Areas.md ═══
writeFileSync(KB_DIR + '/03_Areas.md', `# Areas

## Current Knowledge
**Known areas (from Excel files):**
| Area | Files Found | Customers | Meter Types |
|------|-----------|-----------|-------------|
| Golf Extension | Golf Invoices, Solar Tracking, Water Collection, Electricity Collection | ~2,800+ | Water, Electricity, Solar |
| October | October Smart Water | ~3,000+ | Water |
| Palm Central | Palm Central Water BTU | ~50+ | Water, BTU |
| The Crown | Crown Electricity, Crown Water | ~1,200+ | Electricity, Water |

**Schema support:**
- \`Customer.area\` field exists (String, optional)
- \`Meter.area\` field exists (String, optional)
- \`User.area\` field exists (String, default "")
- \`Project\` model exists with \`organizationId\` FK

## Unknown
- Total number of areas
- Whether each area has separate infrastructure (VM, database, domain)
- Future areas planned
- Area-specific configuration requirements

## Assumptions
- Area field in schema is sufficient for current needs
- Multi-tenancy (org isolation) will be needed for full separation

## Confidence
- Known areas: 100% (from Excel files)
- Area structure in schema: 90%
- Infrastructure per area: Unknown

## Need User Confirmation
- [ ] Confirm complete list of areas
- [ ] Confirm if each area needs separate infrastructure
`);

// ═══ 05_Meter_Types.md ═══
writeFileSync(KB_DIR + '/05_Meter_Types.md', `# Meter Types

## Current Knowledge
**Meter types found in Excel files and schema:**
| Type | Found In | Schema Support |
|------|---------|---------------|
| Water | All water tracking sheets | \`Meter.type\` field (String) |
| Electricity | Crown Electricity, Golf Electricity | \`Meter.type\` field (String) |
| Solar | Solar Tracking Sheet Golf | \`Meter.type\` field (String) |
| BTU | Palm Central BTU sheet | \`Meter.type\` field (String) |

**Meter model fields:** id, serial (unique), type, location, status, area, customerId, archivedAt, createdAt, updatedAt

## Unknown
- Full list of meter types and their specifications
- Whether each meter type has different reading units (kWh, m³, BTU, etc.)
- Meter installation and maintenance processes

## Assumptions
- Meter types are defined as strings in the type field
- Different meter types may have different reading frequencies

## Confidence
- Found types: 100% (from Excel data)
- Schema coverage: 80%

## Need User Confirmation
- [ ] Confirm complete list of meter types
- [ ] Confirm reading units per meter type
`);

// ═══ 08_Billing_Model.md ═══
writeFileSync(KB_DIR + '/08_Billing_Model.md', `# Billing Model

## Current Knowledge
**From Excel files:**
- Monthly invoices per meter per customer
- Opening balance tracking (carried forward debt)
- Billing status: "Yes" or "No" per customer
- Date columns in Excel are serial numbers representing months
- Large variety of invoice amounts (from 9 EGP to 3,200+ EGP)

**Schema support:**
- \`Invoice\` model exists (number, amount, status, dueDate, issuedAt, paidAt)
- \`InvoiceItem\` model exists
- \`BillCycle\` model exists
- \`BillRun\` model exists
- \`ChargeRule\` model exists
- \`DiscountRule\` model exists
- \`InvoiceTax\` model exists

## Unknown
- Billing cycle frequency (monthly seems likely)
- Who generates invoices (MeterVerse or pre-calculated)
- How opening balance is calculated
- Whether invoices include detailed line items (consumption, service fees, taxes)

## Assumptions
- Monthly billing cycle
- Invoice amount = consumption × tariff rate (+ fees + taxes)
- Opening balance = sum of unpaid previous invoices

## Confidence
- Schema covers billing: 85%
- Actual billing logic: 50%

## Need User Confirmation
- [ ] Confirm billing cycle frequency
- [ ] Confirm how invoice amounts are calculated
- [ ] Confirm opening balance calculation
`);

// ═══ 09_Collections.md ═══
writeFileSync(KB_DIR + '/09_Collections.md', `# Collections

## Current Knowledge
**From Excel files (Water Collection — 1,047,034 rows, Electricity Collection — ~500,000 rows):**
- Monthly collection sheets organized by month (JAN-22 through DEC-24+)
- Each payment records: Date, Billing Months, Customer Name, Unit, Amount Paid, Payment Method, Notes

**Payment methods found:**
| Method | Arabic | Usage |
|--------|--------|-------|
| POS | POS | High |
| Cash | كاش | High |
| Bank Transfer | تحويل بنكي | Medium |
| Online | On line | Low |

**Schema support:**
- \`Payment\` model exists (invoiceId, amount, method, status, paidAt)
- \`PaymentGateway\` model exists
- \`PaymentTransaction\` model exists
- \`CollectionCase\` model exists
- \`CollectionAction\` model exists
- \`PromiseToPay\` model exists

## Unknown
- Payment reconciliation process
- How partial payments are handled
- Payment terms and grace periods
- Whether late fees / penalties are applied

## Assumptions
- POS is the primary payment method
- Cash collections require receipt generation
- Bank transfers require manual reconciliation

## Confidence
- Payment methods: 100% (from Excel data)
- Collection volume: 100% (1.5M+ records)
- Schema coverage: 80%

## Need User Confirmation
- [ ] Confirm all payment methods accepted
- [ ] Confirm reconciliation process
- [ ] Confirm late payment penalties
`);

// ═══ 12_SYMBIOT.md ═══
writeFileSync(KB_DIR + '/12_SYMBIOT.md', `# SYMBIOT Integration

## Current Knowledge
**What we know:**
- SYMBIOT is an external central service that connects to physical meters
- SYMBIOT receives and stores meter reading data
- MeterVerse connects to SYMBIOT as an "admin user" to access the data
- SYMBIOT provides daily readings and various other data
- The connection is made via API (MeterVerse acts as a client)

## Unknown
- Authentication method (API key? OAuth? Username/password?)
- API endpoints and data format
- One central SYMBIOT or one per area
- Push (SYMBIOT sends) or Pull (MeterVerse fetches)
- Data frequency (real-time, hourly, daily)
- What data beyond readings does SYMBIOT provide? (Alerts, status, events?)

## Assumptions
- MeterVerse will pull data from SYMBIOT on a scheduled basis
- SYMBIOT has a REST API
- SYMBIOT meters are identified by serial number (matching MeterVerse)

## Confidence
- SYMBIOT purpose: 90% (user explained clearly)
- Integration method: 30% (need API details)
- Data model: Unknown

## Need User Confirmation
- [ ] Provide SYMBIOT API documentation
- [ ] Confirm authentication method
- [ ] Confirm data frequency and format
`);

// ═══ 17_Permissions.md ═══
writeFileSync(KB_DIR + '/17_Permissions.md', `# Permissions

## Current Knowledge
**What exists:**
- 57 permission keys seeded in database
- requirePermission() middleware with role-based wildcard matching
- 5 user roles: super_admin, admin, operator, billing, viewer
- PermissionOnRole join table
- Only 8/21 route files currently use requirePermission()

**Operation types needed (from user):**
- View element
- Add element
- Edit element
- Activate element
- Deactivate element
- Terminate element
- Archive element
- Delete element
- Future operations

## Unknown
- Whether permissions should be per-user or per-role or both
- Custom role creation workflow
- Whether area-based permissions are needed (user sees only their area)

## Assumptions
- 9 operation types × entity count = 500+ permission keys needed
- Custom roles will be needed
- Area-based data visibility will be needed

## Confidence
- Current permission system: 95% (built and tested)
- Coverage completeness: 30% (only 8/21 routes use it)

## Need User Confirmation
- [ ] Confirm all operation types needed
- [ ] Confirm custom role requirements
- [ ] Confirm area-based permissions
`);

// ═══ 10_Financial_Model.md ═══
writeFileSync(KB_DIR + '/10_Financial_Model.md', `# Financial Model

## Current Knowledge
**From data analysis:**
- Customer ledger: opening balance + monthly invoices - payments = closing balance
- Payment center: collections via POS, Cash, Bank Transfer, Online
- Ledger tracks per customer per month

**Schema:**
- Invoice, Payment, InvoiceItem models exist
- No dedicated CustomerLedger or AccountantLedger model
- No wallet/balance model

## Unknown
- Whether double-entry accounting is needed
- Whether general ledger (GL) codes are needed
- Whether financial period closing is needed
- Whether receivables aging is needed

## Assumptions
- Customer ledger can be calculated (not stored) as running balance
- Full accounting integration is Wave 07 scope

## Confidence
- Current financial schema: 60%
- Full requirements: Unknown
`);

console.log('Knowledge base populated from schema and Excel analysis');
