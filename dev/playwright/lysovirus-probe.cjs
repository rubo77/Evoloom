// Probe: fire a lysovirus and verify the spawn clearance hugs the membrane
// edge along the fire axis, plus screenshot the two-line HUD weapon readout.
// Run: cd dev/playwright && PLAYWRIGHT_BROWSERS_PATH=~/.playwright-browsers node lysovirus-probe.cjs
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/ruben/.playwright-browsers/chromium-1217/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, storageState: 'storage-state.json' });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  await page.goto('http://localhost:9131/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.click('#menu-toggle');
  await page.waitForSelector('#control-panel.open');
  await page.click('#game-btn');
  await page.waitForTimeout(4000); // player cell grows

  // Player ring size: find the green microbe's extent via the canvas —
  // easier: read centroid + max radius from the worker snapshot is not
  // exposed; infer from the [WEAPON] log instead. Fire east.
  const pad = await page.$('#fire-pad');
  const box = await pad.boundingBox();
  await page.mouse.click(box.x + box.width * 0.95, box.y + box.height * 0.5);
  await page.waitForTimeout(300);

  const fireLog = logs.find((l) => l.includes('[WEAPON] lysovirus fired'));
  console.log('FIRE:', fireLog);

  // Screenshot HUD corner (fire pad + stats box).
  await page.screenshot({ path: '/var/tmp/devin/lysovirus-hud.png', clip: { x: 0, y: 0, width: 420, height: 320 } });

  // Second shot after cooldown to check spawn distances differ per direction.
  await page.waitForTimeout(1800);
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.05);
  await page.waitForTimeout(300);
  const logs2 = logs.filter((l) => l.includes('[WEAPON] lysovirus fired'));
  console.log('ALL SHOTS:', logs2);
  await page.screenshot({ path: '/var/tmp/devin/lysovirus-hud2.png', clip: { x: 0, y: 0, width: 420, height: 320 } });

  await browser.close();
})();
