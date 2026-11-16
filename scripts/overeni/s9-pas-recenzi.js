#!/usr/bin/env node
/* S9 #54: ověření pásu recenzí v prohlížeči (tah myší, tah prstem, návrat).

   node scripts/overeni/s9-pas-recenzi.js [--base https://eldr.webflow.io]
        [--local] [--out docs/snimky/s9]

   --local  místo skriptu z jsDelivr podstrčí src/dev/testimonial-marquee.js
            z pracovního adresáře (kontrola před merge).
   Potřebuje Playwright s Chromiem (v repu není, v cloudové session je
   nainstalovaný globálně). Výstup: tabulka kontrol, snímky a video. */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const BASE = opt('--base') || 'https://eldr.webflow.io';
const OUT = path.resolve(opt('--out') || 'docs/snimky/s9');
const LOCAL = args.includes('--local');
const DEV_FILE = path.join(__dirname, '..', '..', 'src', 'dev', 'testimonial-marquee.js');

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✅ ' : '  ❌ ') + name + (detail ? '  (' + detail + ')' : ''));
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, options, url) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'cs-CZ', ...options });
  if (LOCAL) {
    await context.route(/cdn\.jsdelivr\.net\/gh\/lukas-webkit-studio\/eldr@[^/]+\/src\/dev\/testimonial-marquee\.js/, route =>
      route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(DEV_FILE, 'utf8') })
    );
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'load' });
  // Cookie lišta překrývá spodek okna a brala by kliky.
  await page.addStyleTag({ content: '.cookiebanner, .cookiesconsent, [fs-cc="banner"] { display: none !important; }' });
  return { context, page, errors };
}

// Posun pásu a rozměry. half = šířka jednoho seznamu.
const state = page =>
  page.evaluate(() => {
    const root = document.querySelector('.testimonial21_marquee');
    const track = root.firstElementChild;
    const m = /translate3d\(([-\d.]+)px/.exec(track.style.transform || '');
    const r = root.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    return {
      x: m ? parseFloat(m[1]) : 0,
      half: track.scrollWidth / 2,
      ready: root.hasAttribute('data-marquee-ready'),
      dragging: root.hasAttribute('data-marquee-dragging'),
      cursor: getComputedStyle(root).cursor,
      covered: t.left <= r.left + 1 && t.right >= r.right - 1,
      box: { left: r.left, top: r.top, width: r.width, height: r.height },
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  });

// Rychlost pásu v px/s za dané okno. Přetočení smyčky se odečte.
async function speed(page, ms = 400) {
  const a = await state(page);
  const t0 = Date.now();
  await sleep(ms);
  const b = await state(page);
  let d = b.x - a.x;
  if (d > a.half / 2) d -= a.half;
  if (d < -a.half / 2) d += a.half;
  return d / ((Date.now() - t0) / 1000);
}

function delta(a, b) {
  let d = b.x - a.x;
  if (d > a.half / 2) d -= a.half;
  if (d < -a.half / 2) d += a.half;
  return d;
}

async function toMarquee(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.testimonial21_marquee');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2);
  });
  await sleep(600);
}

async function desktop(browser) {
  console.log('\nDesktop 1440, myš — ' + BASE + '/');
  const { context, page, errors } = await open(
    browser,
    { viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 960, height: 600 } } },
    BASE + '/'
  );
  await toMarquee(page);
  await page.mouse.move(700, 20);
  await sleep(1500);

  let s = await state(page);
  ok('modul pás převzal (data-marquee-ready)', s.ready);
  const box = s.box;
  const cy = box.top + box.height / 2;

  const base = await speed(page, 1000);
  ok('běžná rychlost kolem -40 px/s', near(base, -40, 4), base.toFixed(1) + ' px/s');
  await page.screenshot({ path: path.join(OUT, 'desktop-1-pred-tahem.jpg'), quality: 70 });

  // hover
  await page.mouse.move(700, cy);
  await sleep(2500);
  const hov = await speed(page, 500);
  ok('hover: pás plynule zastaví', near(hov, 0, 1), hov.toFixed(1) + ' px/s');
  s = await state(page);
  const cursorCard = await page.evaluate(
    ([x, y]) => getComputedStyle(document.elementFromPoint(x, y)).cursor,
    [700, cy]
  );
  ok('kurzor grab na pásu i nad kartou', s.cursor === 'grab' && cursorCard === 'grab', s.cursor + ' / ' + cursorCard);

  // tah doleva 300 px, puštění po pauze (bez setrvačnosti)
  const url0 = page.url();
  let a = await state(page);
  await page.mouse.down();
  await page.mouse.move(700 - 6, cy, { steps: 2 });
  await page.mouse.move(700 - 306, cy, { steps: 15 });
  await sleep(150);
  let b = await state(page);
  const cursorDrag = await page.evaluate(
    ([x, y]) => getComputedStyle(document.elementFromPoint(x, y)).cursor,
    [700 - 306, cy]
  );
  ok('tah doleva 300 px posune pás 1 : 1', near(delta(a, b), -300, 3), delta(a, b).toFixed(1) + ' px');
  ok('při tahu kurzor grabbing', b.dragging && cursorDrag === 'grabbing', cursorDrag);
  await page.screenshot({ path: path.join(OUT, 'desktop-2-tah-doleva.jpg'), quality: 70 });
  await page.mouse.up();
  await sleep(300);
  ok('tah nespustil klik na kartu (adresa se nezměnila)', page.url() === url0, page.url());

  // tah doprava přes začátek smyčky, víc než šířka okna
  a = await state(page);
  await page.mouse.move(200, cy);
  await page.mouse.down();
  await page.mouse.move(206, cy, { steps: 2 });
  let covered = true;
  for (let i = 1; i <= 24; i++) {
    await page.mouse.move(206 + i * 50, cy);
    const st = await state(page);
    covered = covered && st.covered && st.x <= 0 && st.x > -st.half;
  }
  await sleep(150);
  b = await state(page);
  ok('tah doprava 1200 px posune pás 1 : 1', near(delta(a, b), 1200, 3) || near(b.x - a.x + a.half, 1200, 3) || near(b.x - a.x, 1200 - a.half, 3), (b.x - a.x).toFixed(1) + ' px, half ' + a.half);
  ok('smyčka navazuje oběma směry (pás vždy kryje celé okno, x v rozsahu)', covered);
  await page.screenshot({ path: path.join(OUT, 'desktop-3-tah-doprava.jpg'), quality: 70 });
  await sleep(200);
  await page.mouse.up();
  ok('tah doprava nespustil klik', page.url() === url0);

  // puštění bez setrvačnosti, myš pryč z pásu: rychlost po 1, 3 a 5 s
  await page.mouse.move(700, cy);
  await page.mouse.down();
  await page.mouse.move(600, cy, { steps: 10 });
  await sleep(200);
  await page.mouse.up();
  const released = Date.now();
  await page.mouse.move(700, 20);
  const at = async sec => {
    await sleep(Math.max(0, released + sec * 1000 - 200 - Date.now()));
    return speed(page, 400);
  };
  const v1 = await at(1);
  const v3 = await at(3);
  const v5 = await at(5);
  ok('1 s po puštění pás stojí', near(v1, 0, 1), v1.toFixed(1) + ' px/s');
  ok('3 s po puštění se rozjíždí', v3 < -15 && v3 > -40.5, v3.toFixed(1) + ' px/s');
  ok('5 s po puštění jede běžnou rychlostí', near(v5, -40, 4), v5.toFixed(1) + ' px/s');

  // hod: rychlý tah a puštění v pohybu
  await page.mouse.move(900, cy);
  await sleep(1200);
  a = await state(page);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(900 - i * 40, cy);
  await page.mouse.up();
  await page.mouse.move(700, 20);
  const f1 = await speed(page, 150);
  await sleep(700);
  b = await state(page);
  const f2 = await speed(page, 300);
  ok('setrvačnost: po puštění pás dojíždí ve směru tahu', f1 < -60, f1.toFixed(0) + ' px/s hned po puštění');
  ok('setrvačnost: dojezd plynule brzdí', Math.abs(f2) < Math.abs(f1) / 3, f2.toFixed(1) + ' px/s po 1 s');
  ok('setrvačnost: pás dojel dál než tah', delta(a, b) < -340, delta(a, b).toFixed(0) + ' px celkem, tah 320 px');
  await sleep(4500);
  const f3 = await speed(page, 600);
  ok('po dojezdu a pauze zase běžná rychlost', near(f3, -40, 4), f3.toFixed(1) + ' px/s');

  // tah, který skončí mimo pás: pás nesmí zůstat stát
  await page.mouse.move(700, cy);
  await page.mouse.down();
  await page.mouse.move(600, cy, { steps: 5 });
  await page.mouse.move(600, cy - box.height, { steps: 5 });
  await sleep(150);
  await page.mouse.up();
  await sleep(4500);
  const out = await speed(page, 600);
  ok('tah puštěný mimo pás: pás se rozjede', near(out, -40, 4), out.toFixed(1) + ' px/s');

  // fokus z klávesnice
  // Skutečný Tab: fokus nastavený skriptem po práci s myší není :focus-visible.
  await page.evaluate(() => document.querySelectorAll('.testimonial21_marquee a')[2].focus({ preventScroll: true }));
  const beforeTab = await speed(page, 500);
  ok('fokus po kliknutí myší (ne z klávesnice) pás nezastaví', near(beforeTab, -40, 4), beforeTab.toFixed(1) + ' px/s');
  await page.keyboard.press('Tab');
  await sleep(2500);
  const foc = await speed(page, 500);
  ok('fokus z klávesnice: pás stojí', near(foc, 0, 1), foc.toFixed(1) + ' px/s');
  await page.evaluate(() => document.activeElement.blur());
  await sleep(2500);
  const blur = await speed(page, 500);
  ok('po odchodu fokusu pás jede', near(blur, -40, 4), blur.toFixed(1) + ' px/s');

  // mimo viewport
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
  const off = await speed(page, 600);
  ok('mimo viewport smyčka neběží', off === 0, off.toFixed(1) + ' px/s');
  await toMarquee(page);
  await sleep(1500);

  // klik bez tahu
  await page.mouse.move(700, cy);
  await sleep(300);
  await page.mouse.down();
  await page.mouse.up();
  await sleep(1500);
  ok('klik bez tahu otevře referenci', /\/reference/.test(page.url()), page.url());

  ok('bez chyb v konzoli stránky', errors.length === 0, errors.join(' | '));
  const video = page.video();
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(OUT, 'desktop-tah.webm'));
}

async function touch(browser) {
  console.log('\nDotyk 390 — ' + BASE + '/');
  const { context, page, errors } = await open(
    browser,
    {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 2,
      recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
    },
    BASE + '/'
  );
  const cdp = await context.newCDPSession(page);
  const touchEvent = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  async function swipe(x0, y0, x1, y1, steps = 12, hold = 0) {
    await touchEvent('touchStart', x0, y0);
    for (let i = 1; i <= steps; i++) {
      await touchEvent('touchMove', x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
      await sleep(16);
    }
    if (hold) await sleep(hold);
    await touchEvent('touchEnd');
  }

  await toMarquee(page);
  await sleep(1500);
  let s = await state(page);
  const cy = s.box.top + s.box.height / 2;
  ok('modul pás převzal', s.ready);
  const base = await speed(page, 800);
  ok('běžná rychlost kolem -40 px/s', near(base, -40, 4), base.toFixed(1) + ' px/s');
  await page.screenshot({ path: path.join(OUT, 'mobil-1-pred-tahem.jpg'), quality: 70 });

  // vodorovný tah prstem doleva, puštění po pauze
  const url0 = page.url();
  let a = await state(page);
  await swipe(320, cy, 80, cy + 4, 12, 250);
  let b = await state(page);
  // První krok tahu (20 px) padne na rozhodnutí o směru, pás se pak drží prstu.
  ok('tah prstem doleva posune pás 1 : 1', near(delta(a, b), -220, 4), delta(a, b).toFixed(1) + ' px, čekáno -220');
  ok('stránka se při vodorovném tahu nehýbe do stran ani svisle', b.scrollX === 0 && b.scrollY === a.scrollY, 'scrollX ' + b.scrollX + ', scrollY ' + a.scrollY + ' → ' + b.scrollY);
  await page.screenshot({ path: path.join(OUT, 'mobil-2-po-tahu-doleva.jpg'), quality: 70 });
  ok('tah prstem nespustil klik', page.url() === url0);

  // doprava
  a = await state(page);
  await swipe(60, cy, 330, cy - 3, 12, 250);
  b = await state(page);
  ok('tah prstem doprava posune pás 1 : 1', near(delta(a, b), 247.5, 4), delta(a, b).toFixed(1) + ' px, čekáno 247,5');
  await page.screenshot({ path: path.join(OUT, 'mobil-3-po-tahu-doprava.jpg'), quality: 70 });

  // návrat po puštění
  const released = Date.now();
  const at = async sec => {
    await sleep(Math.max(0, released + sec * 1000 - 200 - Date.now()));
    return speed(page, 400);
  };
  const v1 = await at(1);
  const v3 = await at(3);
  const v5 = await at(5);
  ok('1 s po puštění pás stojí', near(v1, 0, 1), v1.toFixed(1) + ' px/s');
  ok('3 s po puštění se rozjíždí', v3 < -15 && v3 > -40.5, v3.toFixed(1) + ' px/s');
  ok('5 s po puštění jede běžnou rychlostí', near(v5, -40, 4), v5.toFixed(1) + ' px/s');

  // švih prstem: setrvačnost
  a = await state(page);
  await swipe(330, cy, 90, cy, 6);
  const f1 = await speed(page, 150);
  await sleep(900);
  b = await state(page);
  ok('švih prstem: pás dojíždí setrvačností', f1 < -60 && delta(a, b) < -260, f1.toFixed(0) + ' px/s po puštění, celkem ' + delta(a, b).toFixed(0) + ' px');
  await sleep(4500);

  // svislý tah přes pás: stránka scrolluje, pás jede dál
  a = await state(page);
  await swipe(195, cy + 40, 200, cy - 200, 12);
  await sleep(400);
  b = await state(page);
  ok('svislý tah přes pás scrolluje stránku', b.scrollY - a.scrollY > 150, 'scrollY +' + (b.scrollY - a.scrollY));
  ok('svislý tah pás nechytil', !b.dragging && b.scrollX === 0);
  const after = await speed(page, 600);
  ok('po svislém scrollu pás jede bez pauzy', near(after, -40, 6), after.toFixed(1) + ' px/s');

  // ťuknutí otevře referenci
  await toMarquee(page);
  s = await state(page);
  await page.touchscreen.tap(195, s.box.top + s.box.height / 2);
  await sleep(1500);
  ok('ťuknutí bez tahu otevře referenci', /\/reference/.test(page.url()), page.url());

  ok('bez chyb v konzoli stránky', errors.length === 0, errors.join(' | '));
  const video = page.video();
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(OUT, 'mobil-tah.webm'));
}

async function reducedMotion(browser) {
  console.log('\nprefers-reduced-motion — ' + BASE + '/');
  const { context, page } = await open(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, BASE + '/');
  await toMarquee(page);
  await sleep(1000);
  const r = await page.evaluate(() => {
    const root = document.querySelector('.testimonial21_marquee');
    root.scrollLeft = 500;
    return {
      ready: root.hasAttribute('data-marquee-ready'),
      overflowX: getComputedStyle(root).overflowX,
      touchAction: getComputedStyle(root).touchAction,
      scrollLeft: root.scrollLeft,
      transform: root.firstElementChild.style.transform,
    };
  });
  ok('reduced motion: modul nic nespustil', !r.ready && !r.transform);
  ok('reduced motion: pás jde posouvat nativně', r.overflowX === 'auto' && r.scrollLeft === 500 && r.touchAction === 'auto', JSON.stringify(r));
  await context.close();
}

async function locales(browser) {
  for (const loc of ['/en', '/de']) {
    console.log('\nDesktop 1440 — ' + BASE + loc);
    const { context, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } }, BASE + loc);
    await toMarquee(page);
    await page.mouse.move(700, 20);
    await sleep(1500);
    const s = await state(page);
    const cy = s.box.top + s.box.height / 2;
    const base = await speed(page, 800);
    ok(loc + ': pás jede', s.ready && near(base, -40, 4), base.toFixed(1) + ' px/s');
    const a = await state(page);
    await page.mouse.move(800, cy);
    await page.mouse.down();
    await page.mouse.move(794, cy, { steps: 2 });
    await page.mouse.move(494, cy, { steps: 10 });
    await sleep(150);
    const b = await state(page);
    await page.mouse.up();
    ok(loc + ': tah posune pás', near(delta(a, b), -300, 12), delta(a, b).toFixed(1) + ' px');
    ok(loc + ': bez chyb', errors.length === 0, errors.join(' | '));
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  try {
    await desktop(browser);
    await touch(browser);
    await reducedMotion(browser);
    await locales(browser);
  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (results.length - failed.length) + ' prošlo, ' + failed.length + ' selhalo');
  fs.writeFileSync(path.join(OUT, 'vysledky.json'), JSON.stringify({ base: BASE, local: LOCAL, kdy: new Date().toISOString(), results }, null, 2) + '\n');
  process.exit(failed.length ? 1 : 0);
})();
