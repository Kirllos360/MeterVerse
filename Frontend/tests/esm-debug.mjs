console.log('Starting...');
import('playwright').then(async (pw) => {
  console.log('Playwright imported successfully');
  const { chromium } = pw;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  console.log('Browser launched');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log('Navigating...');
  await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Page loaded');
  await page.screenshot({ path: 'esm-test.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
}).catch(e => console.error('FAILED:', e.message, e.stack));
