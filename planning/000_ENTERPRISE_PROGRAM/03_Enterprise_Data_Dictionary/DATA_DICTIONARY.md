# Enterprise Data Dictionary

**Purpose:** Single source of truth for every data entity, field, and its meaning.

## Customer

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Meter

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Reading

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Invoice

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Payment

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Contract

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## User

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

## Notification

| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |
|-------|------|----------|-----------------|-------|-----------|---------|----------|
| id | UUID | No | Unique identifier | System | No | Yes | No |
| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |
| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |
| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |

