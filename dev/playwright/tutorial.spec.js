// Test: interactive tutorial overlay — walks all steps, screenshots key demos
// Run:  PLAYWRIGHT_BROWSERS_PATH=/home/ruben/.playwright-browsers npx playwright test tutorial.spec.js --project=chromium
// Needs the app served on :9131 (bash run.sh or python3 -m http.server 9131 from repo root)

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:9131/';

test('tutorial button opens coach overlay and walks all steps', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE);
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.waitForTimeout(3000); // let the sim produce first frames

  await page.click('#tutorial-btn');
  await expect(page.locator('#tutorial-card')).toBeVisible();
  await expect(page.locator('.tutorial-title')).toHaveText('Welcome to Evoloom');
  await page.screenshot({ path: 'test-results/tut-01-welcome.png' });

  const stepTitles = [
    'The soup: atoms, states, bonds',
    'Camera & views',
    'The Controls panel',
    'Pause and look closely',
    'Select & inspect atoms',
    'A real protocell',
    'Genome copying & division',
    'Paint atoms yourself',
    'Water & hydrolysis',
    'Lysin — the predator molecule',
    'Noise & evolution',
    'Play mode — steer a microbe',
    'Save, load, freeze',
    'Build your own chemistry',
    "You're set — go evolve things",
  ];

  for (let i = 0; i < stepTitles.length; i++) {
    await page.click('#tut-next');
    await expect(page.locator('.tutorial-title')).toHaveText(stepTitles[i]);
    await page.waitForTimeout(600);
    if (i === 3) await page.screenshot({ path: 'test-results/tut-05-paused.png' });
    if (i === 5) await page.screenshot({ path: 'test-results/tut-07-protocell.png' });
    if (i === 11) await page.screenshot({ path: 'test-results/tut-13-game.png' });
  }

  // "Done" on the last step closes the tour
  await page.click('#tut-next');
  await expect(page.locator('#tutorial-overlay')).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('Esc leaves the tutorial midway', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('#canvas', { timeout: 15000 });
  await page.click('#tutorial-btn');
  await page.click('#tut-next');
  await page.keyboard.press('Escape');
  await expect(page.locator('#tutorial-overlay')).toHaveCount(0);
});
