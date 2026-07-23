# Database Rules

1. All models have UUID primary keys
2. All models have createdAt, updatedAt timestamps
3. Soft delete via archivedAt (not hard delete)
4. Foreign keys must have @@index
5. Status fields should use Prisma enum (future wave)
6. Migrations must have rollback plan
7. Never use SELECT * — always specify fields
8. All text fields have max length validation
9. JSON fields store structured configuration
10. Connection string from environment, never hardcoded
