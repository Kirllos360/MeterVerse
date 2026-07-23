const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--proxy-server=\"direct://\"'] });
  const page = await browser.newPage();
  
  // Test basic connectivity
  try {
    const resp = await page.goto('http://example.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('External URL: OK (' + resp.status() + ')');
  } catch(e) {
    console.log('External URL: FAILED - ' + e.message.substring(0, 60));
  }
  
  // Test localhost
  try {
    const resp = await page.goto('http://127.0.0.1:7400/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('127.0.0.1:7400: OK (' + resp.status() + ')');
  } catch(e) {
    console.log('127.0.0.1:7400: FAILED - ' + e.message.substring(0, 60));
  }
  
  await browser.close();
})();
