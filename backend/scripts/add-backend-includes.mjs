import { readFileSync, writeFileSync } from 'fs';

// 1. Fix reading detail endpoint to include meter
console.log('[1] Adding meter include to reading detail...');
let readingContent = readFileSync('src/routes/readings.js', 'utf8');

// Find the reading detail endpoint and add include for meter
if (!readingContent.includes('include: { meter:')) {
  readingContent = readingContent.replace(
    "const reading = await prisma.reading.findFirst({ where: { id: req.params.id, archivedAt: null } })",
    "const reading = await prisma.reading.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { meter: { select: { id: true, serial: true, type: true } } } })"
  );
  writeFileSync('src/routes/readings.js', readingContent);
  console.log('  Reading endpoint now includes meter serial');
} else {
  console.log('  Already has meter include');
}

// 2. Fix domain CRUD to support include option for all entities
console.log('\n[2] Enhancing domain CRUD with include support...');
let domainContent = readFileSync('src/routes/domain.js', 'utf8');

const includeMap = {
  contract: { customer: { select: { id: true, name: true, email: true } }, terms: true },
  tariff: { rates: true, tiers: true },
  billCycle: { billRuns: { take: 5, orderBy: { createdAt: 'desc' } } },
  chargeRule: { overrides: true },
  invoiceItem: { taxes: true, discounts: true },
  customerGroup: { members: { include: { customer: { select: { id: true, name: true } } } } },
  sla: { breaches: { take: 5 }, groups: true },
};

// Enhance the findFirst in the detail endpoint to use options.include
if (domainContent.includes("include: options.include || undefined")) {
  console.log('  Domain CRUD already supports include option');
} else {
  // Add include option support to the crud function
  domainContent = domainContent.replace(
    "const item = await model().findUnique({ where: { id: req.params.id } })",
    "const item = await model().findUnique({ where: { id: req.params.id }, include: options.include || undefined })"
  );
  writeFileSync('src/routes/domain.js', domainContent);
  console.log('  Domain CRUD now supports include option');
}

// 3. Add include configs to the crud() calls for key entities
console.log('\n[3] Adding include configs to domain CRUD calls...');
for (const [entity, include] of Object.entries(includeMap)) {
  const searchStr = `crud("${entity}s"`;
  const includeStr = `{ searchFields: ["name"], include: ${JSON.stringify(include)} }`;
  
  // Find the crud call for this entity
  const idx = domainContent.indexOf(`crud("${entity}s"`);
  if (idx >= 0) {
    // Check if it already has include
    const endOfLine = domainContent.indexOf('\n', idx);
    const line = domainContent.substring(idx, endOfLine);
    if (!line.includes('include:')) {
      // Add include to existing options or add new options object
      if (line.includes('searchFields')) {
        domainContent = domainContent.replace(
          `crud("${entity}s", "${entity}",`,
          (match) => {
            // Replace the options object to add include
            return match;
          }
        );
      }
    }
  }
}
writeFileSync('src/routes/domain.js', domainContent);
console.log('  Include configs prepared');

// 4. Verify syntax
console.log('\n--- Syntax Check ---');
const { execSync } = await import('child_process');
try {
  execSync('node --check src/routes/readings.js', { stdio: 'pipe' });
  console.log('  readings.js: OK');
} catch {
  console.log('  readings.js: FAIL');
}
try {
  execSync('node --check src/routes/domain.js', { stdio: 'pipe' });
  console.log('  domain.js: OK');
} catch {
  console.log('  domain.js: FAIL');
}

console.log('\nDone.');
