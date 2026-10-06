// Test: game-mode fire pad — visible only in play mode, a directional
// press fires a lysin dart toward the press offset, the compass needle
// turns to the aim, and the cooldown sweep blocks instant re-fire.
// Run:  PLAYWRIGHT_BROWSERS_PATH=/home/ruben/.playwright-browsers \
//         npx playwright test fire-pad.spec.js --project=chromium
// Needs the app served on :9131 (bash run.sh)

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:9131/';

test('fire pad fires a lysin dart toward the press offset', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const logs = [];
  page.on('console', (m) => { logs.push(m.text()); });

  await page.goto(BASE);
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);

  // Pad must be hidden in sandbox mode.
  const pad = page.locator('#fire-pad');
  await expect(pad).toBeHidden();

  // Enter game mode — pad appears in the top-left, replacing the legend.
  // The controls panel must be open to reach the button.
  await page.click('#menu-toggle');
  await expect(page.locator('#control-panel.open')).toBeVisible();
  await page.click('#game-btn');
  await expect(pad).toBeVisible({ timeout: 10000 });

  // Press right of center → dart should fly east (dir ≈ (1, 0)).
  const box = await pad.boundingBox();
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);

  // Main thread logs the requested direction; the needle turns east.
  await page.waitForTimeout(500);
  const fireLog = logs.find((l) => l.includes('[FIRE] dart requested'));
  expect(fireLog).toBeTruthy();
  expect(fireLog).toContain('dir(1.00,0.00)');

  const needleDeg = await page.locator('#fire-needle')
    .evaluate((el) => el.style.transform);
  expect(needleDeg).toContain('rotate(90deg)'); // 0deg = up → east is +90

  // Cooldown is iteration-based (720 iters, ~400 ms at full rate), so
  // only a re-press that lands while the counter still runs is blocked:
  // wait for the first shot's worker log, re-press immediately, then
  // confirm a press after the reload window fires again.
  const firedCount = () => logs.filter((l) => l.includes('[WEAPON] dart fired')).length;
  await expect.poll(firedCount, { timeout: 8000 }).toBe(1);

  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await page.waitForTimeout(200);
  expect(firedCount()).toBe(1);

  await page.waitForTimeout(3000); // well past the reload window
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await expect.poll(firedCount, { timeout: 5000 }).toBe(2);

  // Pad hides again when leaving game mode.
  await page.keyboard.press('g'); // panel is closed — shortcut toggles game mode
  await expect(pad).toBeHidden({ timeout: 10000 });
});
