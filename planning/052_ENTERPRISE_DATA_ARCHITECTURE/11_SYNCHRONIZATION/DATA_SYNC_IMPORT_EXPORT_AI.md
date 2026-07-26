# Data Synchronization, Import/Export & AI Architecture

**File:** `planning/052_ENTERPRISE_DATA_ARCHITECTURE/11_SYNCHRONIZATION/DATA_SYNC_IMPORT_EXPORT_AI.md`

---

## Data Synchronization Architecture

```mermaid
graph TD
    subgraph "October Area"
        O_M[Meter Data]
        O_R[Reading Data]
        O_C[Customer Data]
    end
    
    subgraph "New Cairo Area"
        NC_M[Meter Data]
        NC_R[Reading Data]
        NC_C[Customer Data]
    end
    
    subgraph "SODIC Area"
        S_M[Meter Data]
        S_R[Reading Data]
        S_C[Customer Data]
    end
    
    subgraph "Central Platform"
        SYNC[Sync Engine]
        DB[(Central Database)]
        CONFLICT[Conflict Resolver]
    end
    
    O_M -->|Push/Pull| SYNC
    O_R --> SYNC
    O_C --> SYNC
    NC_M --> SYNC
    NC_R --> SYNC
    NC_C --> SYNC
    S_M --> SYNC
    S_R --> SYNC
    S_C --> SYNC
    
    SYNC --> DB
    DB --> CONFLICT
    CONFLICT -->|Resolved| DB
    CONFLICT -->|Unresolved| MANUAL[Manual Review]
```

### Sync Types
| Type | Direction | Frequency | Protocol | Verification |
|------|-----------|-----------|----------|--------------|
| Meter Data | Bidirectional | Every 15min | REST + Checksum | SHA-256 hash |
| Reading Data | Area → Central | Real-time | REST | Timestamp ordering |
| Customer Data | Central → Area | Hourly | REST + Full sync nightly | Record count |
| Invoice Data | Central → Area | After generation | REST | Checksum |
| Payment Data | Central → Area | Real-time | REST | Idempotency key |
| Configuration | Central → Areas | On change | REST + Version | Version number |

### Conflict Resolution Strategy
| Data Type | Resolution | Audit |
|-----------|------------|-------|
| Meter Data | Last-writer-wins by timestamp | Full conflict log |
| Reading Data | Append-only (no conflicts possible) | N/A |
| Customer Data | Last-writer-wins + manual review option | Conflict + resolution logged |
| Configuration | Central authority (area cannot override) | Override attempt logged |

---

## Import/Export Platform

### Supported Formats
| Format | Import | Export | Bulk | Streaming |
|--------|--------|--------|------|-----------|
| CSV | ✅ | ✅ | ✅ | ✅ |
| Excel (.xlsx) | ✅ | ✅ | ✅ | ❌ |
| JSON | ✅ | ✅ | ✅ | ✅ |
| XML | ✅ | ✅ | ❌ | ❌ |
| PDF | ❌ | ✅ (Reports) | ❌ | ❌ |
| EDI-867 | ✅ (Settlements) | ❌ | ✅ | ❌ |

### Import Validation Pipeline
```mermaid
graph TD
    FILE[File Upload] --> FORMAT{Format Valid?}
    FORMAT -->|No| REJECT[Reject with Error]
    FORMAT -->|Yes| SCHEMA{Schema Valid?}
    SCHEMA -->|No| REJECT
    SCHEMA -->|Yes| VALIDATE[Row-by-Row Validation]
    VALIDATE -->|Pass| IMPORT[Import Rows]
    VALIDATE -->|Fail| REPORT[Generate Error Report]
    IMPORT --> COMPLETE[Import Complete]
    REPORT --> PARTIAL[Partial Import]
```

---

## AI Data Architecture

### Knowledge Storage
```mermaid
graph TD
    SOURCE[Data Sources] --> EMBED[Embedding Model]
    EMBED --> VECTOR[(Vector Store)]
    EMBED --> INDEX[(Search Index)]
    
    QUERY[User Query] --> QUERY_EMBED[Query Embedding]
    QUERY_EMBED --> SEARCH[Vector Similarity Search]
    SEARCH --> CONTEXT[Retrieved Context]
    CONTEXT --> LLM[LLM Prompt]
    LLM --> RESPONSE[AI Response]
    RESPONSE --> FEEDBACK[Feedback Loop]
    FEEDBACK --> EMBED
```

### AI Data Entities
| Entity | Storage | Format | Retention | Backup Priority |
|--------|---------|--------|-----------|----------------|
| Prompts | PostgreSQL | JSON | Indefinite | High |
| Embeddings | Vector DB (pgvector) | Float array | 1 year | Medium |
| Conversations | PostgreSQL | JSON | 30 days | Low |
| Knowledge | PostgreSQL | Full text | Indefinite | High |
| Training Data | Object Store | Parquet | Per model version | High |
| Model Registry | PostgreSQL | JSON | Indefinite | High |

### RAG Architecture
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Vector Store | pgvector (PostgreSQL extension) | Store and search embeddings |
| Embedding Model | text-embedding-3-small (OpenAI) or all-MiniLM-L6-v2 (local) | Convert text to vectors |
| LLM | llama-3.1-8b (Cloudflare), GPT-4o-mini (fallback) | Generate responses |
| Context Window | 8K tokens | Maximum context length |
| Chunk Strategy | Overlapping chunks (256 tokens, 32 token overlap) | Document splitting |
| Retrieval | Hybrid (vector + keyword) | Best relevance |
| Ranking | Cross-encoder re-ranking | Precision improvement |
