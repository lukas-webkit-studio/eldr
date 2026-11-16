#!/usr/bin/env node
/* S9 #54: ověření pásu recenzí v prohlížeči (tah myší, tah prstem, návrat).

   node scripts/overeni/s9-pas-recenzi.js [--base https://eldr.webflow.io]
        [--local] [--video] [--out docs/snimky/s9]

   --local  místo skriptu z jsDelivr podstrčí src/dev/testimonial-marquee.js
            z pracovního adresáře (kontrola před merge).
   --video  nahraje i video (desktop a mobil, dohromady kolem 9 MB; do repa
            se nedává).
   Potřebuje Playwright s Chromiem (v repu není, v cloudové session je
   nainstalovaný globálně). Výstup: tabulka kontrol, snímky, vysledky.json. */

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
const VIDEO = args.includes('--video');
const DEV_FILE = path.join(__dirname, '..', '..', 'src', 'dev', 'testimonial-marquee.js');

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✅ ' : '  ❌ ') + name + (detail ? '  (' + detail + ')' : ''));
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, options, url) {
  // ignoreHTTPSErrors: cloudová session jde ven přes proxy s vlastní certifikační autoritou.
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

// Nahraje polohu pásu a čas každého snímku po dobu ms. Spouští se bez čekání,
// výsledek se vyzvedne přes collect().
const record = (page, ms) =>
  page.evaluate(ms => {
    const track = document.querySelector('.testimonial21_marquee').firstElementChild;
    window.__rec = new Promise(resolve => {
      const out = [];
      const t0 = window.performance.now();
      const tick = t => {
        const m = /translate3d\(([-\d.]+)px/.exec(track.style.transform || '');
        out.push([t, m ? parseFloat(m[1]) : 0]);
        if (t - t0 < ms) requestAnimationFrame(tick);
        else resolve({ frames: out, half: track.scrollWidth / 2 });
      };
      requestAnimationFrame(tick);
    });
  }, ms);
const collect = page => page.evaluate(() => window.__rec);

// Rychlosti po oknech 100 ms od času from (ms, čas stránky).
function profile(rec, from) {
  const { frames, half } = rec;
  const out = [];
  let i = frames.findIndex(f => f[0] >= from);
  while (i >= 0 && i < frames.length - 1) {
    let j = i;
    while (j < frames.length - 1 && frames[j][0] - frames[i][0] < 100) j++;
    if (frames[j][0] - frames[i][0] < 60) break;
    let d = 0;
    for (let k = i + 1; k <= j; k++) {
      let step = frames[k][1] - frames[k - 1][1];
      if (step > half / 2) step -= half;
      if (step < -half / 2) step += half;
      d += step;
    }
    out.push(d / ((frames[j][0] - frames[i][0]) / 1000));
    i = j;
  }
  return out;
}

// Časy mezi snímky v ms.
function frameTimes(rec) {
  const d = [];
  for (let i = 1; i < rec.frames.length; i++) d.push(rec.frames[i][0] - rec.frames[i - 1][0]);
  d.sort((a, b) => a - b);
  return {
    count: d.length,
    median: d[Math.floor(d.length / 2)],
    p95: d[Math.floor(d.length * 0.95)],
    max: d[d.length - 1],
    over20: d.filter(t => t > 20).length,
  };
}
const ft = f => 'medián ' + f.median.toFixed(1) + ' ms, p95 ' + f.p95.toFixed(1) + ' ms, max ' + f.max.toFixed(1) + ' ms, nad 20 ms: ' + f.over20 + ' z ' + f.count;

function delta(a, b) {
  let d = b.x - a.x;
  if (d > a.half / 2) d -= a.half;
  if (d < -a.half / 2) d += a.half;
  return d;
}

// Švih myší: pohyby po jednom snímku, jinak je prohlížeč sloučí do jednoho.
// Poslední pohyb a puštění jdou hned za sebou; s čekáním mezi nimi by na
// pomalém stroji puštění přišlo pozdě a nebyl by to hod.
async function fling(page, x, y) {
  for (let i = 1; i <= 7; i++) {
    await page.mouse.move(x - i * 40, y);
    await sleep(16);
  }
  await Promise.all([page.mouse.move(x - 320, y), page.mouse.up()]);
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
    { viewport: { width: 1440, height: 900 }, ...(VIDEO ? { recordVideo: { dir: OUT, size: { width: 960, height: 600 } } } : {}) },
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

  // puštění bez hození, myš pryč z pásu: rychlost po 0,5, 2 a 4 s
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
  const v1 = await at(0.5);
  const v3 = await at(2);
  const v5 = await at(4);
  ok('puštění bez hození: 0,5 s poté pás stojí', near(v1, 0, 1.5), v1.toFixed(1) + ' px/s');
  ok('puštění bez hození: 2 s poté se rozjíždí', v3 < -15 && v3 > -40.5, v3.toFixed(1) + ' px/s');
  ok('puštění bez hození: 4 s poté běžná rychlost', near(v5, -40, 4), v5.toFixed(1) + ' px/s');

  // hod: rychlý tah a puštění v pohybu
  await page.mouse.move(900, cy);
  await sleep(1200);
  a = await state(page);
  await page.mouse.down();
  await fling(page, 900, cy);
  await page.mouse.move(700, 20);
  const f1 = await speed(page, 150);
  await sleep(700);
  b = await state(page);
  const f2 = await speed(page, 300);
  ok('setrvačnost: po puštění pás dojíždí ve směru tahu', f1 < -60, f1.toFixed(0) + ' px/s hned po puštění');
  ok('setrvačnost: dojezd plynule brzdí a nezastaví', Math.abs(f2) < Math.abs(f1) / 2 && f2 < -35, f2.toFixed(1) + ' px/s po 1 s');
  ok('setrvačnost: pás dojel dál než tah', delta(a, b) < -340, delta(a, b).toFixed(0) + ' px celkem, tah 320 px');
  await sleep(4500);
  const f3 = await speed(page, 600);
  ok('po hození zase běžná rychlost', near(f3, -40, 4), f3.toFixed(1) + ' px/s');

  // stisk během dojezdu: pás se zastaví hned a karta pod kurzorem se neotevře
  await page.mouse.move(900, cy);
  await sleep(500);
  await page.mouse.down();
  await fling(page, 900, cy);
  await sleep(100);
  await page.mouse.down();
  await sleep(80);
  const caught = await speed(page, 300);
  await page.mouse.up();
  await sleep(400);
  ok('stisk během dojezdu pás hned zastaví', near(caught, 0, 2), caught.toFixed(1) + ' px/s');
  ok('stisk, který zastavil dojezd, neotevře kartu', page.url() === url0, page.url());
  await page.mouse.move(700, 20);
  await sleep(4500);

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
      ...(VIDEO ? { recordVideo: { dir: OUT, size: { width: 390, height: 844 } } } : {}),
    },
    BASE + '/'
  );
  const cdp = await context.newCDPSession(page);
  const touchEvent = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  // Tah po úsečkách mezi body, krok po kroku jako prst. hold = stání před puštěním.
  async function swipe(points, { steps = 12, hold = 0, step = 16, lift = true } = {}) {
    await touchEvent('touchStart', points[0][0], points[0][1]);
    for (let p = 1; p < points.length; p++) {
      const [x0, y0] = points[p - 1];
      const [x1, y1] = points[p];
      for (let i = 1; i <= steps; i++) {
        await touchEvent('touchMove', x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
        await sleep(step);
      }
    }
    if (hold) await sleep(hold);
    if (lift) await touchEvent('touchEnd');
  }
  const rad = deg => (deg * Math.PI) / 180;
  const settle = () => sleep(3500);

  await toMarquee(page);
  await sleep(1500);
  let s = await state(page);
  const cy = s.box.top + s.box.height / 2;
  ok('modul pás převzal', s.ready);
  const base = await speed(page, 800);
  ok('běžná rychlost kolem -40 px/s', near(base, -40, 4), base.toFixed(1) + ' px/s');
  await page.screenshot({ path: path.join(OUT, 'mobil-1-pred-tahem.jpg'), quality: 70 });
  const url0 = page.url();

  // šikmé tahy: 30° a 40° od vodorovné posouvají pás, stránka stojí
  for (const deg of [30, 40]) {
    const dx = -200 * Math.cos(rad(deg));
    const dy = -200 * Math.sin(rad(deg));
    const a = await state(page);
    await swipe([[320, cy + 60], [320 + dx, cy + 60 + dy]], { hold: 250 });
    const b = await state(page);
    // První krok tahu padne na rozhodnutí o směru, pás se pak drží prstu.
    const want = dx * (11 / 12);
    ok('tah pod ' + deg + '° posune pás 1 : 1', near(delta(a, b), want, 6), delta(a, b).toFixed(1) + ' px, čekáno ' + want.toFixed(1));
    ok('tah pod ' + deg + '°: stránka se nehne', b.scrollX === 0 && b.scrollY === a.scrollY, 'scrollY ' + a.scrollY + ' → ' + b.scrollY);
    await settle();
  }
  await page.screenshot({ path: path.join(OUT, 'mobil-2-po-sikmem-tahu.jpg'), quality: 70 });
  ok('šikmý tah nespustil klik', page.url() === url0);

  // 60°: scroll stránky, pás se nechytí
  let a = await state(page);
  await swipe([[300, cy + 80], [300 - 200 * Math.cos(rad(60)), cy + 80 - 200 * Math.sin(rad(60))]], { lift: false });
  let mid = await state(page);
  await touchEvent('touchEnd');
  await sleep(500);
  let b = await state(page);
  ok('tah pod 60° scrolluje stránku', b.scrollY - a.scrollY > 100, 'scrollY +' + (b.scrollY - a.scrollY));
  ok('tah pod 60° pás nechytí', !mid.dragging && Math.abs(delta(a, b)) < 60, 'posun pásu ' + delta(a, b).toFixed(1) + ' px (jen vlastní chod)');
  await toMarquee(page);
  await sleep(1500);
  s = await state(page);
  const cy2 = s.box.top + s.box.height / 2;

  // tah zahájený vodorovně, pak 80 px svislého úletu: pás drží až do puštění
  a = await state(page);
  await swipe([[320, cy2], [260, cy2 + 3], [180, cy2 - 80]], { hold: 250, lift: false });
  mid = await state(page);
  await touchEvent('touchEnd');
  b = await state(page);
  // Prohlížeč první pohyby do ~10 px nepošle, o ty je posun kratší než dráha prstu (140 px).
  ok('po zámku drží tah i s 80 px svislého úletu', mid.dragging && delta(a, b) < -118 && delta(a, b) > -137, 'posun ' + delta(a, b).toFixed(1) + ' px při dráze prstu 140 px');
  ok('při úletu se stránka svisle nehne', b.scrollY === a.scrollY && b.scrollX === 0, 'scrollY ' + a.scrollY + ' → ' + b.scrollY);
  await page.screenshot({ path: path.join(OUT, 'mobil-3-po-tahu-s-uletem.jpg'), quality: 70 });

  // puštění bez hození: pauza ~1 s, pak plynulý rozjezd
  const released = Date.now();
  const at = async sec => {
    await sleep(Math.max(0, released + sec * 1000 - 200 - Date.now()));
    return speed(page, 400);
  };
  const v1 = await at(0.5);
  const v3 = await at(2);
  const v5 = await at(4);
  ok('puštění bez hození: 0,5 s poté pás stojí', near(v1, 0, 1.5), v1.toFixed(1) + ' px/s');
  ok('puštění bez hození: 2 s poté se rozjíždí', v3 < -15 && v3 > -40.5, v3.toFixed(1) + ' px/s');
  ok('puštění bez hození: 4 s poté běžná rychlost', near(v5, -40, 4), v5.toFixed(1) + ' px/s');

  // hození doleva: rychlost po 100 ms, spojitě do -40 px/s, bez nuly a pauzy
  const now = () => page.evaluate(() => window.performance.now());
  a = await state(page);
  await record(page, 5200);
  await sleep(300);
  await swipe([[330, cy2], [90, cy2 - 20]], { steps: 6 });
  let t = await now();
  let rec = await collect(page);
  let prof = profile(rec, t + 30);
  b = await state(page);
  let rising = prof.every((p, i) => i === 0 || p >= prof[i - 1] - 6);
  let min = Math.min(...prof.map(Math.abs));
  ok('hození doleva: rychlost hned po puštění odpovídá švihu', prof[0] < -400, prof[0].toFixed(0) + ' px/s');
  ok('hození doleva: průběh je monotónní, bez skoku', rising, prof.slice(0, 12).map(p => p.toFixed(0)).join(' → ') + ' …');
  ok('hození doleva: pás nikdy nezastaví (žádná nula ani pauza)', min > 30, 'nejpomalejší okno ' + min.toFixed(1) + ' px/s');
  ok('hození doleva: skončí na běžné rychlosti', near(prof[prof.length - 1], -40, 5), prof[prof.length - 1].toFixed(1) + ' px/s po ' + (prof.length / 10).toFixed(1) + ' s');
  results[results.length - 1].profil = prof.map(p => Math.round(p));

  // hození doprava: zpomalí, projde nulou a rozjede se doleva, jednou křivkou
  await record(page, 5200);
  await sleep(300);
  await swipe([[60, cy2], [300, cy2 + 15]], { steps: 6 });
  t = await now();
  rec = await collect(page);
  prof = profile(rec, t + 30);
  const falling = prof.every((p, i) => i === 0 || p <= prof[i - 1] + 6);
  ok('hození doprava: začne doprava', prof[0] > 400, prof[0].toFixed(0) + ' px/s');
  ok('hození doprava: průběh je monotónní přes nulu až do -40 px/s', falling && near(prof[prof.length - 1], -40, 5), prof.slice(0, 14).map(p => p.toFixed(0)).join(' → ') + ' … ' + prof[prof.length - 1].toFixed(0));
  results[results.length - 1].profil = prof.map(p => Math.round(p));

  // svislý tah přes pás: stránka scrolluje, pás jede dál
  a = await state(page);
  await swipe([[195, cy2 + 40], [200, cy2 - 200]]);
  await sleep(400);
  b = await state(page);
  ok('svislý tah přes pás scrolluje stránku', b.scrollY - a.scrollY > 150, 'scrollY +' + (b.scrollY - a.scrollY));
  const after = await speed(page, 600);
  ok('po svislém scrollu pás jede bez pauzy', near(after, -40, 6), after.toFixed(1) + ' px/s');

  // snímkové časy: CPU 4× pomalejší, tah a dojezd
  await toMarquee(page);
  await sleep(1500);
  s = await state(page);
  const cy3 = s.box.top + s.box.height / 2;
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await sleep(500);
  await record(page, 1500);
  await swipe([[340, cy3], [60, cy3 - 30], [300, cy3 + 10]], { steps: 30 });
  const drag = frameTimes(await collect(page));
  await record(page, 2500);
  await swipe([[330, cy3], [90, cy3]], { steps: 6 });
  const coast = frameTimes(await collect(page));
  await record(page, 2000);
  const idle = frameTimes(await collect(page));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  ok('snímky při tahu (CPU 4× pomalejší): p95 do 20 ms', drag.p95 <= 20, ft(drag));
  ok('snímky při dojezdu (CPU 4× pomalejší): p95 do 20 ms', coast.p95 <= 20, ft(coast));
  ok('snímky při běžném chodu (CPU 4× pomalejší): p95 do 20 ms', idle.p95 <= 20, ft(idle));
  await sleep(4000);

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
