const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/ruben/.playwright-browsers/chromium-1217/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', (m) => { if (m.text().includes('nearest enemy')) console.log('  ' + m.text()); });
  await page.goto('http://localhost:9131/');
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.click('#menu-toggle');
  await page.click('#game-btn');
  await page.waitForSelector('#fire-pad.shown', { timeout: 10000 });
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1500);
    const s = await page.evaluate(() => ({
      cd: document.getElementById('fire-pad')?.style.getPropertyValue('--cd'),
      empty: document.getElementById('fire-pad')?.className,
      enemy: document.getElementById('fire-enemy')?.className + ' | ' + document.getElementById('fire-enemy')?.style.transform,
      lysin: document.getElementById('fire-lysin')?.className + ' | ' + document.getElementById('fire-lysin')?.style.transform,
    }));
    console.log(`[DBG] ${JSON.stringify(s)}`);
  }
  await browser.close();
})();
