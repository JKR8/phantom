const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click on Templates menu
  await page.click('text=Templates');
  await page.waitForTimeout(500);

  // Click on Portfolio Monitoring
  await page.click('text=Portfolio Monitoring');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: '/mnt/c/Users/jakc9/Documents/Phantom/templates/current-portfolio.png', fullPage: true });

  console.log('Screenshot saved');
  await browser.close();
})();
