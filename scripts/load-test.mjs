// Load test script (T113) â€” runs concurrent API requests
const TARGET = process.env.TARGET || 'http://localhost:3131';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10');
const REQUESTS = parseInt(process.env.REQUESTS || '100');

async function makeRequest(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return { status: res.status, ms: Date.now() - start };
  } catch { return { status: 0, ms: Date.now() - start }; }
}

async function runLoadTest() {
  const urls = [
    `${TARGET}/api/health`,
    `${TARGET}/api/customers`,
    `${TARGET}/api/meters`,
    `${TARGET}/api/readings`,
    `${TARGET}/api/invoices`,
  ];
  
  const results = [];
  const batchSize = Math.min(CONCURRENCY, REQUESTS);
  
  for (let i = 0; i < REQUESTS; i += batchSize) {
    const batch = urls.slice(0, Math.min(urls.length, batchSize));
    const batchResults = await Promise.all(batch.map(url => makeRequest(url)));
    results.push(...batchResults);
    if (i % 10 === 0) process.stdout.write('.');
  }
  
  const success = results.filter(r => r.status === 200).length;
  const avgMs = results.reduce((s, r) => s + r.ms, 0) / results.length;
  const maxMs = Math.max(...results.map(r => r.ms));
  
  console.log(`\nLoad test complete:`);
  console.log(`  Requests: ${REQUESTS}`);
  console.log(`  Success: ${success}/${REQUESTS} (${(success/REQUESTS*100).toFixed(1)}%)`);
  console.log(`  Avg latency: ${avgMs.toFixed(0)}ms`);
  console.log(`  Max latency: ${maxMs}ms`);
}

runLoadTest().catch(console.error);
