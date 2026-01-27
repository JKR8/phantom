const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  // Navigate to app - try both ports
  try {
    await page.goto('http://localhost:5173', { timeout: 5000 });
  } catch (e) {
    await page.goto('http://localhost:5174', { timeout: 5000 });
  }
  await page.waitForTimeout(2000);
  
  // Click on template dropdown and select Portfolio Monitoring
  const templateButton = await page.locator('button:has-text("Template")').first();
  if (await templateButton.isVisible()) {
    await templateButton.click();
    await page.waitForTimeout(500);
    
    const portfolioOption = await page.locator('text=Portfolio Monitoring').first();
    if (await portfolioOption.isVisible()) {
      await portfolioOption.click();
      await page.waitForTimeout(3000);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/portfolio-screenshot.png', fullPage: true });
  console.log('Screenshot saved to test-results/portfolio-screenshot.png');
  
  await browser.close();
})();
