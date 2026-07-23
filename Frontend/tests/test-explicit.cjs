const { chromium } = require('playwright');
(async () => {
  const possiblePaths = [
    'C:/Users/EPower/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    'C:/Users/EPower/AppData/Local/ms-playwright/chromium-1226/chrome-win64/chrome.exe',
    'C:/Users/EPower/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
  ];
  for (const execPath of possiblePaths) {
    try {
      console.log('Trying: ' + execPath);
      const browser = await chromium.launch({ 
        executablePath: execPath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 20000 });
      console.log('SUCCESS with: ' + execPath);
      await page.screenshot({ path: 'explicit-test.png', fullPage: true });
      await browser.close();
      process.exit(0);
    } catch(e) {
      console.log('Failed: ' + e.message.substring(0, 60));
    }
  }
  console.log('ALL PATHS FAILED');
  process.exit(1);
})();
