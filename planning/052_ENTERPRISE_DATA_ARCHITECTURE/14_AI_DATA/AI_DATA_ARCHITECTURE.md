# AI Data Architecture — Diagram D-008

**File:** `14_AI_DATA/AI_DATA_ARCHITECTURE.md`

```mermaid
graph TD
    subgraph "Data Sources"
        DOCS[Documents]
        METER[Meter Data]
        CUSTOMER[Customer Data]
        READINGS[Readings]
        EVENTS[Meter Events]
    end
    
    subgraph "Ingestion & Processing"
        EXTRACT[Extract Text]
        CHUNK[Chunk Documents]
        EMBED[Embedding Model]
        INDEX[Vector Index]
    end
    
    subgraph "Storage"
        VECTOR[(Vector Store<br/>pgvector)]
        KNOWLEDGE[(Knowledge Base<br/>PostgreSQL)]
        MEMORY[(AI Memory<br/>PostgreSQL)]
        PROMPTS[(Prompt Store<br/>PostgreSQL)]
    end
    
    subgraph "Retrieval"
        QUERY[User Query]
        Q_EMBED[Query Embedding]
        SIMILARITY[Vector Similarity]
        HYBRID[Hybrid Search<br/>Vector + Keyword]
        RERANK[Cross-encoder Rerank]
    end
    
    subgraph "Generation"
        CONTEXT[Build Context]
        LLM[LLM Inference<br/>Cloudflare/GPT]
        RESPONSE[Generate Response]
        FEEDBACK[Collect Feedback]
    end
    
    DOCS --> EXTRACT
    METER --> EXTRACT
    CUSTOMER --> EXTRACT
    READINGS --> EXTRACT
    EVENTS --> EXTRACT
    
    EXTRACT --> CHUNK
    CHUNK --> EMBED
    EMBED --> VECTOR
    CHUNK --> KNOWLEDGE
    
    QUERY --> Q_EMBED
    Q_EMBED --> SIMILARITY
    SIMILARITY --> VECTOR
    KNOWLEDGE --> HYBRID
    SIMILARITY --> HYBRID
    HYBRID --> RERANK
    
    VECTOR --> CONTEXT
    KNOWLEDGE --> CONTEXT
    MEMORY --> CONTEXT
    RERANK --> CONTEXT
    
    PROMPTS --> LLM
    CONTEXT --> LLM
    LLM --> RESPONSE
    RESPONSE --> FEEDBACK
    FEEDBACK --> MEMORY
```

## AI Data Components
| Component | Storage | Format | Retention |
|-----------|---------|--------|-----------|
| Vector Store | pgvector | Float[] | 1 year |
| Knowledge Base | PostgreSQL | Text + Metadata | Indefinite |
| AI Memory | PostgreSQL | JSON | 30 days |
| Prompt Store | PostgreSQL | Template + Variables | Indefinite |
| Feedback | PostgreSQL | Score + Comment | 1 year |
| Conversations | PostgreSQL | Message[] | 30 days |
| Training Data | Object Store | Parquet | Per model version |
