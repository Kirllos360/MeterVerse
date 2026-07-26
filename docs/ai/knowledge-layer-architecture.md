# Enterprise Knowledge Layer Architecture

## Design
```
AI Agent → Knowledge Retrieval Layer → Hybrid Search
                                          ├── Vector Search (embeddings)
                                          └── SQL Metadata Filtering

Data Sources:
- Meter database (serial, type, status, readings)
- Customer records (name, email, area, contracts)
- Email history (subject, body, attachments)
- Supplier documents (reports, certificates, logs)
- Maintenance logs (events, actions, dates)
- Invoice history (amounts, dates, statuses)
- Reading history (values, timestamps, anomalies)
```

## Hybrid Search Architecture
```typescript
interface KnowledgeQuery {
  text: string                    // Natural language query
  filters?: {                     // Metadata filters
    meterSerial?: string
    customerId?: string
    dateFrom?: string
    dateTo?: string
    issueType?: string
  }
  limit?: number                  // Max results
  minConfidence?: number          // Minimum similarity score
}

interface KnowledgeResult {
  source: string                  // Which data source
  content: string                 // Retrieved content
  metadata: Record<string, any>   // Source metadata
  score: number                   // Similarity score (0-1)
}
```

## Graph Schema
```
Entities: Meter, Customer, Supplier, SIM, Project, Location, Issue, Email, Invoice, Reading, Incident
Relationships: caused_by, assigned_to, similar_to, reported_by, resolved_by
```
