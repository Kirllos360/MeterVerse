import { readFileSync, writeFileSync } from 'fs';

console.log('═══ Fixing all gaps ═══');

// GAP 3: Pagination max limit
console.log('\n[GAP 3] Adding pagination max limit (cap 100)...');
const routeDir = 'src/routes/';
const routeFiles = ['meters.js', 'invoices.js', 'readings.js', 'payments.js', 'customers.js', 'meter-assignments.js', 'notifications.js', 'admin.js', 'services.js'];

for (const file of routeFiles) {
  const path = routeDir + file;
  try {
    let content = readFileSync(path, 'utf8');
    const original = content;
    
    // Cap take: Number(limit) -> take: Math.min(100, Number(limit))
    content = content.replace(/take:\s*Number\(limit\)/g, 'take: Math.min(100, Number(limit))');
    content = content.replace(/take:\s*Number\(req\.query\.limit\)/g, 'take: Math.min(100, Number(req.query.limit))');
    
    if (content !== original) {
      writeFileSync(path, content);
      console.log('  Fixed pagination cap: ' + file);
    }
  } catch (e) {
    // skip files with errors
  }
}

// GAP 5: Standardize domain CRUD response
console.log('\n[GAP 5] Standardizing domain CRUD response format...');
const domainPath = 'src/routes/domain.js';
let domainContent = readFileSync(domainPath, 'utf8');
domainContent = domainContent.replace(
  'res.json({ [resource]: items, total, page, limit })',
  'res.json({ [resource]: items, items, total, page, limit })'
);
writeFileSync(domainPath, domainContent);
console.log('  Domain CRUD now returns items + [resource] keys');

// GAP 5b: Notification rate limiting
console.log('\n[GAP 5b] Adding notification rate limiting...');
const enginePath = 'src/services/notification-engine.js';
let engineContent = readFileSync(enginePath, 'utf8');

const rateLimitCode = `
// Rate limiting: prevents event spam (60s cooldown per event+recipient)
const COOLDOWN_SECONDS = 60;
const lastSent = new Map();

function isRateLimited(action, recipientId) {
  const key = action + ":" + (recipientId || "global");
  const last = lastSent.get(key);
  if (last && Date.now() - last < COOLDOWN_SECONDS * 1000) return true;
  lastSent.set(key, Date.now());
  return false;
}
`;

// Insert after imports
engineContent = engineContent.replace(
  /import \{ prisma \} from "\.\.\/db\.js"/,
  'import { prisma } from "../db.js"' + rateLimitCode
);

// Add rate limit check at start of processEvent
engineContent = engineContent.replace(
  'export async function processEvent(action, variables = {}, metadata = {}) {',
  'export async function processEvent(action, variables = {}, metadata = {}) {\n  const recipientId = variables.recipientId || metadata.actorId || null;\n  if (isRateLimited(action, recipientId)) {\n    return { action, skipped: true, reason: "Rate limited (cooldown " + COOLDOWN_SECONDS + "s)" };\n  }'
);

writeFileSync(enginePath, engineContent);
console.log('  Rate limiting added (60s cooldown)');

// GAP 8: DELETE idempotency
console.log('\n[GAP 8] Adding DELETE idempotency...');
for (const file of routeFiles) {
  const path = routeDir + file;
  try {
    let content = readFileSync(path, 'utf8');
    const original = content;
    
    // Add existence check before delete
    content = content.replace(
      /(await prisma\.(\w+)\.delete\(\{ where: \{ id: req\.params\.id \} \}\))/g,
      'const existing$2 = await prisma.$2.findUnique({ where: { id: req.params.id } });\n    if (!existing$2) return res.status(404).json({ error: "Not found" });\n    await prisma.$2.delete({ where: { id: req.params.id } })'
    );
    
    if (content !== original) {
      writeFileSync(path, content);
      console.log('  Fixed DELETE idempotency: ' + file);
    }
  } catch (e) {}
}

console.log('\n═══ All gap fixes applied ═══');
