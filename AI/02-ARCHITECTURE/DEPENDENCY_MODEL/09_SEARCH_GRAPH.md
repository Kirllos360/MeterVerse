# 09 — Universal Search Graph

**Version:** 1.0.0  
**Purpose:** Design the universal search engine that searches everything from one input.

---

## 1. Searchable Entities

| Entity | Searchable Fields | Result Preview | Detail Action | Priority |
|--------|------------------|---------------|---------------|----------|
| Customer | nameAr, nameEn, code, phone, email, nationalOrCommercialId, address | Name, code, phone, balance, status badge | Navigate to Customer Workspace | P0 |
| Meter | serialNumber, brand, type, location, customerName | Serial, type, status, last reading, customer | Navigate to Meter Workspace | P0 |
| Invoice | number, customerName, customerId, period | Number, customer, period, total, status | Navigate to Invoice Workspace | P0 |
| Payment | customerName, customerId, reference, amount | Customer, amount, method, date, status | Navigate to Payment Workspace | P1 |
| Reading | meterSerial, customerName, date | Meter, date, consumption, status | Navigate to Reading Explorer (filtered) | P1 |
| Ticket | subject, description, customerName, status | Subject, customer, priority, status | Navigate to Ticket Detail | P1 |
| Project | name, code, area | Name, code, area, status | Navigate to Project Detail | P1 |
| Area | name, code | Name, code | Navigate to Area Settings | P2 |
| Unit | name, code, type, status, customerName | Name, code, type, status, occupied | Navigate to Unit Explorer (filtered) | P2 |
| SIM | iccid, msisdn, provider, status | ICCID, MSISDN, provider, status, meter | Navigate to SIM Detail | P2 |
| User | name, email, role | Name, email, role, status | Navigate to User Settings | P2 |
| Alert | title, description, entityType | Title, severity, entity, status | Navigate to linked entity | P2 |
| Report | name, type, category | Name, type, last run | Navigate to Report | P3 |
| Wallet | customerName, customerId | Customer, balance, status | Navigate to Customer Workspace > Wallet tab | P3 |
| Ledger | customerName, description | Customer, date, amount, type | Navigate to Customer Workspace > Ledger tab | P3 |
| Settlement | customerName, invoiceId | Customer, amount, type, status | Navigate to Settlement | P3 |
| Document | name, type, entityType | Name, type, entity | Navigate to Document Viewer | P3 |

---

## 2. Search Features

| Feature | Implementation |
|---------|---------------|
| **Global Search** | Ctrl+K triggers overlay. Results grouped by entity type. |
| **Quick Search** | Inline search in TopNav. Top 5 results dropdown. |
| **Advanced Search** | Multi-field form with operators (contains, equals, >, <, between). |
| **Fuzzy Search** | Partial matching. Handles typos (Levenshtein distance <= 2). |
| **Arabic Search** | Arabic text search with normalized characters (remove diacritics). |
| **Recent Searches** | Last 10 queries saved to localStorage. |
| **Saved Searches** | (Future) Save filter configurations. |
| **Search Suggestions** | As-you-type suggestions based on popular searches. |
| **Keyboard Navigation** | ↑↓ to navigate results, Enter to select, Esc to close. |
| **Permission-aware** | Results filtered by user's role. Users only see entities they can view. |

---

## 3. Search API Design

| Endpoint | Method | Parameters | Response |
|----------|--------|-----------|----------|
| `/search` | GET | q (query), types[] (entity filter), limit, offset | `{ results: SearchResult[], total: number, took: number }` |
| `/search/suggest` | GET | q (partial query) | `{ suggestions: string[] }` |
| `/search/recent` | GET | — | `{ recent: SearchQuery[] }` |

### SearchResult Format
```typescript
interface SearchResult {
  id: string;
  type: "customer" | "meter" | "invoice" | "payment" | ...;
  label: string;       // Primary display text
  subtitle: string;    // Secondary display text
  badge?: string;      // Status badge text
  badgeColor?: string; // Status badge color
  route: string;       // Navigation target
  score: number;       // Relevance score (0-100)
}
```

---

## 4. Search Index Strategy

| Data Type | Index | Update Frequency |
|-----------|-------|-----------------|
| Customers | PostgreSQL full-text search (GIN index on name/nameAr/code/phone/email) | Real-time (trigger-based) |
| Meters | PostgreSQL full-text search (GIN index on serial/brand/location) | Real-time (trigger-based) |
| Invoices | PostgreSQL full-text search (GIN index on number/customer) | Real-time (trigger-based) |
| Others | On-the-fly search with LIMIT 10 | Real-time |
| History | In-memory cache of recent searches | Session-based |
