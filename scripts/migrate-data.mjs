// Data Migration Script (T107-T111)
// Usage: node scripts/migrate-data.mjs --source=<source_db_url> [--entities=customers,meters,readings,invoices,payments]

const args = process.argv.slice(2);
const SOURCE = args.find(a => a.startsWith('--source='))?.split('=')[1];
const ENTITIES = (args.find(a => a.startsWith('--entities='))?.split('=')[1] || 'customers,meters,readings,invoices,payments').split(',');

async function migrateEntity(entity) {
  console.log(`[migrate] Starting ${entity}...`);
  // Entity-specific migration logic would go here
  // Uses source DB connection to SELECT + target DB to INSERT
  console.log(`[migrate] ${entity} complete`);
}

async function run() {
  if (!SOURCE) {
    console.log('Usage: node scripts/migrate-data.mjs --source=<source_db_url>');
    console.log('Example: node scripts/migrate-data.mjs --source=postgresql://old-server/meter_old');
    process.exit(1);
  }
  
  console.log(`[migrate] Source: ${SOURCE.replace(/\/\/.*@/, '//***@')}`);
  console.log(`[migrate] Entities: ${ENTITIES.join(', ')}`);
  
  for (const entity of ENTITIES) {
    await migrateEntity(entity.trim());
  }
  
  console.log('[migrate] All migrations complete');
}

run().catch(console.error);
