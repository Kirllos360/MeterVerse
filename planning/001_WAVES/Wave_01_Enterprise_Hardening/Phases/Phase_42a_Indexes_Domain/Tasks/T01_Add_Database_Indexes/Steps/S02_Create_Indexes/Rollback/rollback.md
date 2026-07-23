# Rollback: Remove all 68 indexes if migration fails
# Run: npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-migrations prisma/migrations
# Then: npx prisma db execute --file rollback.sql
rollback_steps:
  - "Run: npx prisma migrate diff --to-migrations prisma/migrations --from-schema-datamodel prisma/schema.prisma"
  - "If indexes cause issues: npx prisma db push --force-reset"
  - "Restore from: git checkout backend/prisma/schema.prisma"
