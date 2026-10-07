// Test: game-mode fire pad — visible only in play mode, a directional
// press fires a lysovirus toward the press offset, the compass needle
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
  const fireLog = logs.find((l) => l.includes('[FIRE] lysovirus requested'));
  if (!fireLog) console.log('CAPTURED LOGS:\n' + logs.slice(-40).join('\n'));
  expect(fireLog).toBeTruthy();
  expect(fireLog).toContain('dir(1.00,0.00)');

  const needleDeg = await page.locator('#fire-needle')
    .evaluate((el) => el.style.transform);
  expect(needleDeg).toContain('rotate(90deg)'); // 0deg = up → east is +90

  // Enemy bearing — the red rim tick tracks the nearest enemy membrane
  // and must be visible while enemies exist.
  const enemyTick = page.locator('#fire-enemy');
  await expect(enemyTick).toHaveClass(/shown/, { timeout: 10000 });
  const enemyDeg = await enemyTick.evaluate((el) => el.style.transform);
  expect(enemyDeg).toContain('rotate(');

  // Cooldown is iteration-based (720 iters, ~400 ms at full rate, longer
  // under load). The pad's --cd CSS var mirrors the live fraction — but
  // the snapshot lags the worker log, so after each shot the test must
  // first see the reload ENGAGE (non-zero) before waiting for 0.000,
  // otherwise it reads the stale zero from the previous reload.
  const firedCount = () => logs.filter((l) => l.includes('[WEAPON] lysovirus fired')).length;
  const cooling = () => pad.evaluate((el) => el.style.getPropertyValue('--cd').trim() !== '0.000');
  const reloaded = () => pad.evaluate((el) => el.style.getPropertyValue('--cd').trim() === '0.000');
  const waitReload = async () => {
    await expect.poll(cooling, { timeout: 5000 }).toBe(true);
    await expect.poll(reloaded, { timeout: 15000 }).toBe(true);
  };
  await expect.poll(firedCount, { timeout: 8000 }).toBe(1);

  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await page.waitForTimeout(200);
  expect(firedCount()).toBe(1); // swallowed while the reload still runs

  await waitReload();
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await expect.poll(firedCount, { timeout: 5000 }).toBe(2);

  // Ammo — the match starts with 15 lysin atoms = 3 darts. The third
  // shot fires; the fourth must be rejected as out of lysin.
  await waitReload();
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await expect.poll(firedCount, { timeout: 5000 }).toBe(3);

  await waitReload();
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5);
  await page.waitForTimeout(600);
  expect(firedCount()).toBe(3); // no fourth shot
  // The worker rejects the fire — the status line may be overwritten by
  // the kill feed, so the worker's own log line is the assertion target.
  // Poll it: under parallel workers the reject message can lag the click.
  await expect.poll(
    () => logs.some((l) => l.includes('[WEAPON] fire rejected') && l.includes('out of lysin')),
    { timeout: 5000 }).toBeTruthy();
  await expect(pad).toHaveClass(/empty/);

  // Pad hides again when leaving game mode.
  await page.keyboard.press('g'); // panel is closed — shortcut toggles game mode
  await expect(pad).toBeHidden({ timeout: 10000 });
});
