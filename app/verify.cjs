const { chromium } = require('playwright');
const fs = require('fs');
const SHOTS = __dirname + '/../.shots';
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const notFound = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('response', (r) => r.status() === 404 && notFound.push(r.url()));

  // Главная
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOTS + '/home.png', fullPage: true });
  console.log('tiles:', (await page.$$('section[aria-label="Категории"] button')).length);

  // Клик по плитке категории
  await page.click('section[aria-label="Категории"] button:has-text("Электроника")');
  await page.waitForTimeout(1200);
  console.log('filter electronics →', page.url().includes('categoryId'));

  // Избранное: клик по сердечку первой карточки
  await page.click('button[aria-label="В избранное"] >> nth=0');
  await page.waitForTimeout(500);
  const favBadge = await page.textContent('header nav');
  console.log('fav badge in header:', /1/.test(favBadge));

  // Страница избранного
  await page.goto('http://localhost:5173/favorites', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const favCount = await page.$$eval('.grid > *', (els) => els.length);
  console.log('favorites page items:', favCount);
  await page.screenshot({ path: SHOTS + '/favorites.png' });

  // Карточка: похожие
  await page.goto('http://localhost:5173/listing/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const similar = await page.$$('section[aria-label="Похожие объявления"] .group');
  console.log('similar items:', similar.length);
  await page.screenshot({ path: SHOTS + '/listing.png', fullPage: true });

  // Главная: «недавно смотрели» появилось после просмотра
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const recent = await page.$$('section[aria-label="Вы недавно смотрели"] a');
  console.log('recent items:', recent.length);
  await page.screenshot({ path: SHOTS + '/home-recent.png', fullPage: true });

  // Мобильная
  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  mob.on('console', (m) => m.type() === 'error' && errors.push('[mob] ' + m.text()));
  mob.on('response', (r) => r.status() === 404 && notFound.push('[mob] ' + r.url()));
  await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1500);
  await mob.screenshot({ path: SHOTS + '/mobile.png', fullPage: false });
  console.log('mobile scrollWidth:', await mob.evaluate(() => document.documentElement.scrollWidth));

  console.log('CONSOLE ERRORS:', errors.length, errors.slice(0, 3));
  console.log('404s:', notFound.length, notFound.slice(0, 3));
  await browser.close();
})().catch((e) => {
  console.error('VERIFY FAILED:', e.message);
  process.exit(1);
});
