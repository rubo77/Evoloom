// Probe: how threatening is the enemy seek/bite pressure?
// Starts a match, never steers, samples membrane integrity + bite logs
// every 5s for up to 90s and reports survival.
// Run: NODE_PATH=node_modules node threat-probe.cjs  (app on :9131)
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
    if (t.includes('[GAME] enemy bite')) bites.push(performance.now());
  });
  await page.goto('http://localhost:9131/');
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.click('#menu-toggle');
  await page.click('#game-btn');
  await page.waitForSelector('#fire-pad.shown', { timeout: 10000 });
  const t0 = Date.now();
  let last = '';
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    // pull HUD state out of the DOM status line + snapshot mirror
    const snap = await page.evaluate(() => {
      const o = document.getElementById('game-overlay');
      return {
        status: document.getElementById('status')?.textContent || '',
        // display, not textContent — a hidden overlay keeps stale title
        // text (e.g. the EVOLOOM intro) and would fake a match end.
        overlay: o && getComputedStyle(o).display !== 'none'
          ? (document.getElementById('game-overlay-title')?.textContent || '') : '',
      };
    });
    const el = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`[PROBE] t=${el}s bites=${bites.length} status="${snap.status}" overlay="${snap.overlay}"`);
    if (snap.overlay) { console.log('[PROBE] match ended:', snap.overlay); break; }
    last = snap.status;
  }
  const weaponLogs = logs.filter((l) => l.includes('[WEAPON]') || l.includes('[GAME]'));
  console.log(`[PROBE] result: ${bites.length} bites in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log('[PROBE] last events:\n' + weaponLogs.slice(-8).join('\n'));
  await browser.close();
})();
