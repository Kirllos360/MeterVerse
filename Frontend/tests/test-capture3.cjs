const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Try different URL formats
    const urls = [
      'http://127.0.0.1:7400/admin',
      'http://localhost:7400/admin',
      'http://[::1]:7400/admin',
    ];
    
    for (const url of urls) {
      try {
        console.log('Trying: ' + url);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        console.log('SUCCESS with: ' + url);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-' + url.replace(/[^a-z0-9]/g,'') + '.png', fullPage: true });
        console.log('Screenshot saved');
        break;
      } catch(e) {
        console.log('Failed: ' + e.message.substring(0, 80));
      }
    }
    await browser.close();
  } catch(e) {
    console.error('Script error:', e.message);
  }
})();
