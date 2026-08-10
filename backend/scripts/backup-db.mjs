#!/usr/bin/env node
// Scheduled Backup Automation (T216)
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/meter_pulse';

async function runBackup() {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = join(BACKUP_DIR, date);
  
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  
  console.log(`[backup] Starting backup to ${dir}`);
  
  try {
    execSync(`pg_dump "${DB_URL}" -f "${dir}/full.sql" -F p`, { stdio: 'pipe' });
    console.log(`[backup] Full backup complete: ${dir}/full.sql`);
    
    // Schema-only backup
    execSync(`pg_dump "${DB_URL}" -f "${dir}/schema.sql" -F p --schema-only`, { stdio: 'pipe' });
    console.log(`[backup] Schema backup complete`);
    
    // Data-only backup
    execSync(`pg_dump "${DB_URL}" -f "${dir}/data.sql" -F p --data-only`, { stdio: 'pipe' });
    console.log(`[backup] Data backup complete`);
    
    // Write manifest
    writeFileSync(join(dir, 'backup.json'), JSON.stringify({
      date: new Date().toISOString(),
      type: 'full',
      files: ['full.sql', 'schema.sql', 'data.sql'],
      dbUrl: DB_URL.replace(/\/\/.*@/, '//***@'),
    }, null, 2));
    
    console.log(`[backup] Backup manifest written`);
    console.log(`[backup] SUCCESS`);
    process.exit(0);
  } catch (err) {
    console.error(`[backup] FAILED: ${err.message}`);
    process.exit(1);
  }
}

runBackup();
