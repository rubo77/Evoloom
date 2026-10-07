// Probe: can the match be WON? Aggressive play — steer toward the
// enemy tick until inside ~400 units, fire along the bearing on
// reload, flee briefly on proximity/bite, rearm at the amber dot.
// Run: NODE_PATH=node_modules node win-probe.cjs  (app on :9131)
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
  let shots = 0;

  const info = async () => page.evaluate(() => {
    const deg = (id) => {
      const el = document.getElementById(id);
      const m = /rotate\((-?[\d.]+)deg\)/.exec(el?.style.transform || '');
      return el?.classList.contains('shown') && m ? parseFloat(m[1]) : null;
    };
    return {
      enemy: deg('fire-enemy'),
      lysin: deg('fire-lysin'),
      dist: parseFloat(document.getElementById('fire-enemy')?.dataset.dist || '0'),
      cd: document.getElementById('fire-pad')?.style.getPropertyValue('--cd').trim(),
      empty: document.getElementById('fire-pad')?.classList.contains('empty'),
      overlay: document.getElementById('game-overlay-title')?.textContent || '',
    };
  });
  const aim = (deg, toward) => {
    const rad = (deg - 90) * Math.PI / 180;
    const s = toward ? 1 : -1;
    return page.mouse.move(cx + s * Math.cos(rad) * 350, cy + s * Math.sin(rad) * 350, { steps: 3 });
  };

  for (let i = 0; i < 300; i++) {
    await page.waitForTimeout(400);
    const s = await info();
    if (s.overlay) {
      console.log(`[WIN] t=${((Date.now() - t0) / 1000).toFixed(0)}s shots=${shots} bites=${bites.length} RESULT: ${s.overlay}`);
      break;
    }
    const bittenRecently = bites.length && Date.now() - bites[bites.length - 1] < 4000;
    if (bittenRecently && s.enemy !== null) await aim(s.enemy, false);
    else if (s.empty && s.lysin !== null) await aim(s.lysin, true);
    else if (s.enemy !== null) await aim(s.enemy, s.dist < 220 ? false : true); // hunt unless hugging

    if (s.cd === '0.000' && !s.empty && s.enemy !== null && s.dist < 450) {
      const box = await pad.boundingBox();
      const rad = (s.enemy - 90) * Math.PI / 180;
      await page.mouse.up();
      await page.mouse.click(box.x + box.width / 2 + Math.cos(rad) * box.width * 0.4,
                             box.y + box.height / 2 + Math.sin(rad) * box.height * 0.4);
      shots++;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
    }
    if (i % 25 === 24) {
      console.log(`[WIN] t=${((Date.now() - t0) / 1000).toFixed(0)}s shots=${shots} bites=${bites.length} dist=${s.dist}`);
    }
  }
  console.log('[WIN] kills/pickups:\n' + logs.filter((l) => l.includes('Enemy down') || l.includes('lysin collected') || l.includes('lysovirus detonated')).slice(-20).join('\n'));
  await browser.close();
})();
