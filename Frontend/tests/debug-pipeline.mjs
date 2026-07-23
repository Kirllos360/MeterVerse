import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, '..');
const BASE = 'http://localhost:7400';

const adminDir = join(FRONTEND, 'src', 'app', 'admin');
const adminPages = readdirSync(adminDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(adminDir, d.name, 'page.tsx')))
  .map(d => ({ name: d.name, path: '/admin/' + d.name }));

console.log('Capturing', adminPages.length, 'admin pages');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

let success = 0, fail = 0;
const SCREENSHOTS = join(FRONTEND, '..', 'docs', 'screenshots', 'pipeline-debug');
mkdirSync(join(SCREENSHOTS, 'admin'), { recursive: true });

for (const cap of adminPages.slice(0, 5)) {
  try {
    console.log('Fetching:', cap.path);
    await page.goto(BASE + cap.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SCREENSHOTS, 'admin', cap.name + '.png'), fullPage: true });
    console.log('  ?', cap.name);
    success++;
  } catch(e) {
    console.log('  ?', cap.name, '-', e.message.substring(0, 80));
    fail++;
  }
}

console.log('Results:', success, 'success,', fail, 'failed');
await browser.close();
