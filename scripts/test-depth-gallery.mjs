import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const baseURL = process.env.GIRLIE_TEST_URL || 'http://127.0.0.1:5173/';
const output = process.env.GIRLIE_TEST_OUTPUT || '/private/tmp/girlie-depth-gallery-qa';
await mkdir(output, { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const missing = [];
const consoleErrors = [];
const names = ['Emma', 'Anna', 'Élise', 'Mei', 'Yuki', 'Grace', 'Sofia', 'Diya', 'Lily', 'Mia', 'Soo'];
const waitForName = (name, target = page) => target.waitForFunction((expected) => document.querySelector('.depth-caption h2')?.textContent === expected, name);
const exitStory = async () => { await page.keyboard.press('Escape'); await page.locator('.story-overlay').waitFor({ state: 'detached' }); };
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push({ message: message.text(), location: message.location() }); });
page.on('response', (response) => { if (response.url().startsWith(baseURL) && response.status() >= 400) missing.push(`${response.status()} ${response.url()}`); });
try {
  await page.goto(baseURL);
  await page.locator('.nav-gallery-door').first().click();
  await page.locator('.depth-caption h2').waitFor();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${output}/desktop.png` });
  assert.equal(await page.locator('.depth-caption h2').textContent(), 'Emma');
  await page.getByRole('button', { name: 'Next story', exact: true }).click();
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('.depth-caption h2').textContent(), 'Anna');
  await page.screenshot({ path: `${output}/desktop-anna.png` });
  const position = await page.locator('.depth-scroll').evaluate((el) => el.scrollTop);
  await page.locator('.depth-read').click();
  await page.locator('.story-header h2').waitFor();
  assert.equal(await page.locator('.story-header h2').textContent(), 'Anna');
  await exitStory();
  assert.equal(await page.locator('.depth-scroll').evaluate((el) => el.scrollTop), position);
  console.log('PASS desktop story return, exact scroll restoration');

  // All eleven portraits resolve and open their matching existing long-form story.
  await page.keyboard.press('Home');
  await waitForName('Emma');
  for (let index = 0; index < names.length; index++) {
    await waitForName(names[index]);
    const image = page.locator('.depth-portrait img').nth(index);
    await image.evaluate((img) => img.decode());
    const quote = await page.locator('.depth-caption blockquote').textContent();
    await page.locator('.depth-read').click();
    await page.locator('.story-header h2').waitFor();
    assert.equal(await page.locator('.story-header h2').textContent(), names[index]);
    assert.ok((await page.locator('.story-header blockquote').textContent()).includes(quote));
    await exitStory();
    if (index < names.length - 1) await page.getByRole('button', { name: 'Next story', exact: true }).click();
  }
  assert.ok(await page.getByRole('button', { name: 'Next story', exact: true }).isDisabled());
  console.log('PASS all 11 image assets, correct stories/quotes, end bounds');

  // Continue visiting returns to the next gallery entry, not a garden camera jump.
  await page.locator('.depth-read').click();
  await page.getByRole('button', { name: 'Continue visiting →', exact: true }).click();
  await page.locator('.story-overlay').waitFor({ state: 'detached' });
  await waitForName('Emma');
  await page.locator('.depth-gallery select').selectOption('zh');
  assert.equal(await page.locator('.depth-read').textContent(), '阅读她的故事 ↗');
  await page.locator('.depth-read').click();
  assert.ok((await page.locator('.story-header blockquote').textContent()).includes('柔软'));
  await exitStory();
  await page.locator('.depth-gallery select').selectOption('en');
  console.log('PASS Continue visiting, last-to-first loop and EN/中文');
  await page.locator('.depth-back').focus();
  await page.keyboard.press('End');
  await waitForName('Soo');
  await page.waitForTimeout(1000);
  await page.locator('.depth-read').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await exitStory();
  await waitForName('Soo');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.depth-back').focus();
  await page.keyboard.press('Home');
  await waitForName('Emma');
  await page.waitForTimeout(1000);
  console.log('PASS resize while reading preserves the active girl');

  // Wheel motion has fractional depth, without moving the flower garden.
  const gardenTop = await page.evaluate(() => window.scrollY);
  await page.mouse.move(900, 400);
  await page.mouse.wheel(0, 430);
  await page.waitForTimeout(900);
  const fractional = await page.locator('.depth-scroll').evaluate((el) => el.scrollTop);
  assert.ok(fractional > 0 && fractional < 850);
  assert.equal(await page.evaluate(() => window.scrollY), gardenTop);
  await page.locator('.depth-read').click();
  await page.mouse.wheel(0, 600);
  await exitStory();
  assert.equal(await page.locator('.depth-scroll').evaluate((el) => el.scrollTop), fractional);
  assert.equal(await page.evaluate(() => window.scrollY), gardenTop);
  await page.screenshot({ path: `${output}/depth-in-motion.png` });

  // The dialog owns Tab focus; escape exits only the topmost layer.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('.depth-gallery').contains(document.activeElement)));
  }
  await page.locator('.depth-back').focus();
  await page.keyboard.press('End');
  await waitForName('Soo');
  await page.keyboard.press('Home');
  await waitForName('Emma');
  console.log('PASS wheel, fractional return, background lock, keyboard/focus');

  // Responsive captions/controls must not overlap even for the longest quote.
  await page.getByRole('button', { name: 'Next story', exact: true }).click();
  await waitForName('Anna');
  for (const [width, height] of [[1280, 720], [390, 844], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(350);
    const read = await page.locator('.depth-read').boundingBox();
    const footer = await page.locator('.depth-footer').boundingBox();
    await page.screenshot({ path: `${output}/layout-${width}x${height}.png` });
    assert.ok(read.y + read.height <= footer.y + 3, `Caption overlaps footer at ${width}x${height}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/mobile.png` });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.depth-gallery--still').waitFor();
  await page.locator('.depth-back').focus();
  await page.keyboard.press('ArrowRight');
  await waitForName('Élise');
  assert.equal(await page.locator('.depth-portrait').nth(2).evaluate((el) => el.style.transform), 'translate(-50%, -50%)');
  console.log('PASS 4 viewport layouts and reduced-motion navigation');
  await page.keyboard.press('Escape');
  await page.locator('.depth-gallery').waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.deepEqual(consoleErrors, [], 'Gallery browser console errors');
  console.log('PASS gallery console is clean');

  // Existing rooms still open via their original components and iframe.
  await page.locator('.nav-gallery-door').nth(1).click();
  await page.locator('.immersive-gallery').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('.immersive-gallery').waitFor({ state: 'detached' });
  await page.locator('.studio-button').click();
  await page.locator('.room-shell iframe').waitFor();
  assert.ok((await page.locator('.room-shell iframe').getAttribute('src')).includes('legacy.html#private-house'));
  await page.frameLocator('.room-shell iframe').locator('body').waitFor();
  await page.locator('.room-bar button').click();
  await page.locator('.room-overlay').waitFor({ state: 'detached' });
  await page.locator('.create-nav-button').click();
  await page.locator('.room-shell iframe').waitFor();
  await page.frameLocator('.room-shell iframe').locator('#au-email').waitFor({ state: 'visible' });
  console.log('PASS existing collection, Private Girlie and interview login entry');
  await page.locator('.room-bar button').click();
  await page.locator('.room-overlay').waitFor({ state: 'detached' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.hero-museum-button').click();
  await page.locator('.portal-label').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${output}/garden-preserved.png` });
  console.log('PASS flower garden resumes after gallery and room exit');

  // Actual touch events in a mobile browser context, not synthetic scrollTop.
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage();
  await mobile.goto(baseURL);
  await mobile.locator('.mobile-halls-button').click();
  await mobile.locator('.mobile-halls button').first().click();
  await waitForName('Emma', mobile);
  const mobileTop = await mobile.evaluate(() => window.scrollY);
  const cdp = await mobileContext.newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 650 }] });
  for (let y = 630; y >= 150; y -= 30) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
    await mobile.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(1500);
  assert.ok(await mobile.locator('.depth-scroll').evaluate((el) => el.scrollTop > 100));
  assert.equal(await mobile.evaluate(() => window.scrollY), mobileTop);
  await mobile.screenshot({ path: `${output}/mobile-touch.png` });
  await mobileContext.close();
  console.log('PASS real touch swipe and mobile background lock');

  // Simulate unavailable WebGL and a failed image; no blank app or lost story.
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); };
  });
  await fallback.route('**/avatars/Emma.jpg', (route) => route.fulfill({ status: 404, body: '' }));
  await fallback.goto(baseURL);
  await fallback.locator('.museum-webgl-fallback').waitFor();
  await fallback.locator('.nav-gallery-door').first().click();
  await fallback.locator('.depth-image-fallback').waitFor();
  await fallback.locator('.depth-read').click();
  await fallback.locator('.story-header h2').waitFor();
  assert.equal(await fallback.locator('.story-header h2').textContent(), 'Emma');
  await fallback.close();
  console.log('PASS no-WebGL and missing-image fallback');
  assert.deepEqual(errors, [], 'Unexpected JavaScript errors');
  assert.deepEqual(missing, [], 'Missing local assets');
  if (consoleErrors.length) console.log('Existing room/external resource messages:', JSON.stringify(consoleErrors));
  console.log('PASS no JavaScript exceptions or missing local assets');
} finally { await browser.close(); }
