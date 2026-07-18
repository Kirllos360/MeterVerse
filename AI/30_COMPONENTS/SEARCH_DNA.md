# MeterVerse Search DNA

**Defines global search, table search, and advanced search behavior.**

---

## 1. Global Search

- **Trigger:** Ctrl+K or click search icon in TopNav
- **Scope:** Customers, meters, invoices, readings, users, tickets, projects
- **Display:** Command palette-style overlay
- **Results:** Categorized by entity type
- **Navigation:** Click or Enter to navigate to result
- **Keyboard:** Arrow keys for navigation, Esc to close

## 2. Table Search

- **Location:** Above each SmartTable
- **Type:** Text input with search icon
- **Scope:** All visible columns
- **Debounce:** 300ms delay before search
- **Clear:** X button to clear search
- **Filters:** Column-specific filters alongside search

## 3. Advanced Search

- **Access:** "Advanced" button next to table search
- **UI:** Expandable panel with multi-field search form
- **Fields:** Entity-specific (e.g., meter serial, customer name, invoice number)
- **Operators:** Contains, equals, starts with, greater than, less than, between
- **Date ranges:** Calendar date pickers
- **Saved searches:** (Future) Save and reuse search queries

## 4. Search Results

- **Display:** SmartTable with search-highlighted results
- **Count:** "Showing X of Y results" summary
- **Export:** Export search results to CSV/XLSX
- **Empty:** "No results found" with search term displayed

## 5. Search Accessibility

| Requirement | Implementation |
|-------------|---------------|
| aria-label | "Search" on all search inputs |
| aria-live | Result count announced on update |
| Keyboard | Tab to search, Enter to execute |
| Clear | Escape key clears search |
| Focus | Auto-focus search on palette open |
