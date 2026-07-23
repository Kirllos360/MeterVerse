const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ 
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    console.log('Navigating...');
    await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded!');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'system-chrome-test.png', fullPage: true });
    console.log('SUCCESS');
    await browser.close();
  } catch(e) {
    console.error('FAILED:', e.message);
  }
})();
