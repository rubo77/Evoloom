// Test: camera follow mode — after selecting atoms, the 🎥 Follow button
// tracks the selection centroid; a manual pan hands the camera back.
// Run:  PLAYWRIGHT_BROWSERS_PATH=/home/ruben/.playwright-browsers npx playwright test follow.spec.js --project=chromium
// Needs the app served on :9131 (bash run.sh or python3 -m http.server 9131 from repo root)

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:9131/';

test('follow mode tracks selection and yields to manual pan', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE);
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(2500);

  // Follow with nothing selected → button is disabled.
  await page.keyboard.press('m');
  await expect(page.locator('#follow-btn')).toBeDisabled();

  // Select a wide band across the arena's mid-height — the rigged cells
  // live around world y≈1500 and drift, so a broad box always catches
  // some (an empty box selects nothing and Follow refuses to start).
  await page.click('#select-btn');
  await page.mouse.move(100, 420);
  await page.mouse.down();
  await page.mouse.move(1240, 540, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await expect(page.locator('#follow-btn')).toBeEnabled();
  await page.click('#follow-btn');
  await expect(page.locator('#follow-btn')).toContainText('ON');

  // Back to pan: deselectAll fires, but Follow still tracks the
  // captured atoms.
  await page.click('#select-btn');
  await expect(page.locator('#follow-btn')).toContainText('ON');

  // Manual pan takes the camera back → Follow releases.
  await page.mouse.move(640, 360);
  await page.mouse.down();
  await page.mouse.move(500, 300, { steps: 4 });
  await page.mouse.up();
  await expect(page.locator('#follow-btn')).toContainText('OFF');

  expect(errors).toEqual([]);
});
