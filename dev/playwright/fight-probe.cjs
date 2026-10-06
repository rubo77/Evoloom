// Probe: realistic play — flee the red enemy tick, fire at it when
// reloaded, and steer to the amber lysin dot when the magazine runs
// dry. Measures survival + kills for a competently-played match.
// Run: NODE_PATH=node_modules node fight-probe.cjs  (app on :9131)
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

  const pad = page.locator('#fire-pad');
  const canvas = page.locator('#canvas');
  const cbox = await canvas.boundingBox();
  const cx = cbox.x + cbox.width / 2, cy = cbox.y + cbox.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const t0 = Date.now();
  let shots = 0, armed = false;

  const tickDeg = async (id) => page.evaluate((eid) => {
    const el = document.getElementById(eid);
    const m = /rotate\((-?[\d.]+)deg\)/.exec(el?.style.transform || '');
    const shown = el?.classList.contains('shown');
    return shown && m ? parseFloat(m[1]) : null;
  }, id);

  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(500);
    const enemyDeg = await tickDeg('fire-enemy');
    const lysinDeg = await tickDeg('fire-lysin');
    const cd = await pad.evaluate((el) => el.style.getPropertyValue('--cd').trim());
    const empty = await pad.evaluate((el) => el.classList.contains('empty'));

    if (empty && lysinDeg !== null) {
      // Rearm: steer toward the amber dot.
      const rad = (lysinDeg - 90) * Math.PI / 180;
      await page.mouse.move(cx + Math.cos(rad) * 350, cy + Math.sin(rad) * 350, { steps: 3 });
    } else if (enemyDeg !== null) {
      // Kite: flee the nearest enemy.
      const rad = (enemyDeg - 90) * Math.PI / 180;
      await page.mouse.move(cx - Math.cos(rad) * 350, cy - Math.sin(rad) * 350, { steps: 3 });
    }
    // Fire along the enemy bearing when ready and loaded.
    if (cd === '0.000' && !empty && enemyDeg !== null) {
      const box = await pad.boundingBox();
      const rad = (enemyDeg - 90) * Math.PI / 180;
      const px = box.x + box.width / 2 + Math.cos(rad) * box.width * 0.4;
      const py = box.y + box.height / 2 + Math.sin(rad) * box.height * 0.4;
      await page.mouse.up();
      await page.mouse.click(px, py);
      shots++;
      await page.mouse.move(cx - Math.cos(rad) * 350, cy - Math.sin(rad) * 350);
      await page.mouse.down();
    }
    if (i % 20 === 19) {
      const snap = await page.evaluate(() => ({
        status: document.getElementById('status')?.textContent || '',
        overlay: document.getElementById('game-overlay-title')?.textContent || '',
      }));
      console.log(`[FIGHT] t=${((Date.now() - t0) / 1000).toFixed(0)}s shots=${shots} bites=${bites.length} status="${snap.status}" overlay="${snap.overlay}"`);
      if (snap.overlay) break;
    }
  }
  console.log('[FIGHT] kills/pickups:\n' + logs.filter((l) => l.includes('Enemy down') || l.includes('lysin collected')).join('\n'));
  await page.mouse.up().catch(() => {});
  await browser.close();
})();
