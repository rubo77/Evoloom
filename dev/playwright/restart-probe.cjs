// Probe: die passively, then restart via Enter — a new match must
// begin (enemy tick back, overlay gone, bites reset).
// Run: NODE_PATH=node_modules node restart-probe.cjs  (app on :9131)
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/ruben/.playwright-browsers/chromium-1217/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:9131/');
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.click('#menu-toggle');
  await page.click('#game-btn');
  await page.waitForSelector('#fire-pad.shown', { timeout: 10000 });
  // Wait for death overlay (passive player dies in ~60 s).
  await page.waitForSelector('#game-overlay', { state: 'visible', timeout: 150000 });
  const title = await page.locator('#game-overlay-title').textContent();
  const btns = await page.locator('#game-overlay-buttons').isVisible();
  console.log(`[RESTART] dead at overlay="${title}", buttons visible=${btns}`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const after = await page.evaluate(() => ({
    overlay: getComputedStyle(document.getElementById('game-overlay')).display,
    tick: document.getElementById('fire-enemy').className,
    status: document.getElementById('status')?.textContent,
  }));
  console.log(`[RESTART] after Enter: overlay=${after.overlay} tick="${after.tick}" status="${after.status}"`);
  console.log(after.overlay === 'none' && after.tick.includes('shown') ? '[RESTART] PASS' : '[RESTART] FAIL');
  await browser.close();
})();
