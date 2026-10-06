// Probe: can a MOVING player escape the enemy drag-seek?
// Steers AWAY from the #fire-enemy bearing tick (press-and-hold
// steering opposite the nearest enemy), re-aiming every second.
// Compare against the ~60 s idle baseline from threat-probe.cjs.
// Run: NODE_PATH=node_modules node kite-probe.cjs  (app on :9131)
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/ruben/.playwright-browsers/chromium-1217/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const bites = [];
  const logs = [];
  page.on('console', (m) => {
    const t = m.text();
    logs.push(t);
    if (t.includes('[GAME] enemy bite')) bites.push(Date.now());
  });
  await page.goto('http://localhost:9131/');
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.click('#menu-toggle');
  await page.click('#game-btn');
  await page.waitForSelector('#fire-pad.shown', { timeout: 10000 });

  const canvas = page.locator('#canvas');
  const cbox = await canvas.boundingBox();
  const cx = cbox.x + cbox.width / 2, cy = cbox.y + cbox.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down(); // hold — press-and-hold steering
  const t0 = Date.now();

  for (let i = 0; i < 90; i++) {
    await page.waitForTimeout(1000);
    // Nearest-enemy bearing from the rim tick (0deg = up); flee opposite.
    const deg = await page.locator('#fire-enemy').evaluate((el) => {
      const m = /rotate\((-?[\d.]+)deg\)/.exec(el.style.transform || '');
      return m ? parseFloat(m[1]) : null;
    });
    if (deg !== null) {
      const rad = (deg - 90) * Math.PI / 180; // back to atan2 convention
      const ex = cx - Math.cos(rad) * 350, ey = cy - Math.sin(rad) * 350;
      await page.mouse.move(ex, ey, { steps: 4 });
    }
    if (i % 5 === 4) {
      const snap = await page.evaluate(() => ({
        status: document.getElementById('status')?.textContent || '',
        overlay: document.getElementById('game-overlay-title')?.textContent || '',
      }));
      console.log(`[KITE] t=${((Date.now() - t0) / 1000).toFixed(0)}s bites=${bites.length} status="${snap.status}" overlay="${snap.overlay}"`);
      if (snap.overlay) break;
    }
  }
  const dists = logs.filter((l) => l.includes('nearest enemy')).slice(-8);
  console.log('[KITE] last distances:\n' + dists.join('\n'));
  await page.mouse.up().catch(() => {});
  await browser.close();
})();
