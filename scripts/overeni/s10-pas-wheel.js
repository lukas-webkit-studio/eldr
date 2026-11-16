#!/usr/bin/env node
/* S10 #59: ověření pásu recenzí v prohlížeči (touchpad a kolečko přes wheel,
   Shift + kolečko, šipky). Regresi tahu myší a prstem hlídá
   s9-pas-recenzi.js, spouštěj oba.

   node scripts/overeni/s10-pas-wheel.js [--base https://eldr.webflow.io]
        [--local] [--out docs/snimky/s10]

   --local  místo skriptu z jsDelivr podstrčí src/dev/testimonial-marquee.js
            z pracovního adresáře (kontrola před merge).
   Potřebuje Playwright s Chromiem (v repu není, v cloudové session je
   nainstalovaný globálně). Výstup: tabulka kontrol, snímky, vysledky.json.

   Co odsud ověřit nejde: gesto zpět/vpřed dvěma prsty v Safari a Chromu na
   macOS a dojezdové události touchpadu. Playwright posílá wheel jako kolečko
   myši, bez fází gesta. */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const BASE = opt('--base') || 'https://eldr.webflow.io';
const OUT = path.resolve(opt('--out') || 'docs/snimky/s10');
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
  // Záznam všech wheel událostí: listener na window běží až po modulu,
  // takže defaultPrevented je konečný stav.
  await page.evaluate(() => {
    window.__wheel = [];
    window.addEventListener('wheel', e => {
      window.__wheel.push({ dx: e.deltaX, dy: e.deltaY, shift: e.shiftKey, prevented: e.defaultPrevented });
    });
  });
  return { context, page, errors };
}

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
      covered: t.left <= r.left + 1 && t.right >= r.right - 1,
      box: { left: r.left, top: r.top, width: r.width, height: r.height },
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      now: window.performance.now(),
    };
  });

function delta(a, b) {
  let d = b.x - a.x;
  if (d > a.half / 2) d -= a.half;
  if (d < -a.half / 2) d += a.half;
  return d;
}

async function speed(page, ms = 400) {
  const a = await state(page);
  await sleep(ms);
  const b = await state(page);
  return delta(a, b) / ((b.now - a.now) / 1000);
}

// Vyzvedne a vyprázdní záznam wheel událostí.
const wheelLog = page =>
  page.evaluate(() => {
    const log = window.__wheel;
    window.__wheel = [];
    return log;
  });

// Nahraje polohu pásu v každém snímku po dobu ms.
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

async function toMarquee(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.testimonial21_marquee');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2);
  });
  await sleep(600);
}

// Jedno gesto: události jdou po 16 ms, tedy pod hranicí konce gesta (150 ms).
async function gesture(page, steps) {
  for (const [dx, dy] of steps) {
    await page.mouse.wheel(dx, dy);
    await sleep(16);
  }
  await sleep(120);
}
const GAP = 300; // ms mezi gesty, s rezervou nad 150 ms

async function wheel(browser) {
  console.log('\nDesktop 1440, wheel — ' + BASE + '/');
  const { context, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } }, BASE + '/');
  await toMarquee(page);
  await page.mouse.move(700, 20);
  await sleep(1500);

  let s = await state(page);
  ok('modul pás převzal (data-marquee-ready)', s.ready);
  const cy = s.box.top + s.box.height / 2;
  const base = await speed(page, 1000);
  ok('běžná rychlost kolem -40 px/s', near(base, -40, 4), base.toFixed(1) + ' px/s');

  // Kurzor nad pás: hover pás zastaví, pak se měří čistý posun gestem.
  await page.mouse.move(720, cy);
  await sleep(1800);
  await wheelLog(page);

  // 1. vodorovně doleva (deltaX kladná)
  let a = await state(page);
  await gesture(page, [[50, 0], [50, 0], [50, 0], [50, 0], [50, 0], [50, 0]]);
  let b = await state(page);
  let log = await wheelLog(page);
  ok('wheel deltaX +300: pás ujede 300 px doleva', near(delta(a, b), -300, 3), delta(a, b).toFixed(1) + ' px');
  ok('wheel deltaX +300: všechny události defaultPrevented', log.length === 6 && log.every(e => e.prevented), log.length + ' událostí');
  ok('wheel deltaX +300: stránka se nehnula', b.scrollX === a.scrollX && b.scrollY === a.scrollY, 'scroll ' + b.scrollX + ', ' + b.scrollY);
  await page.screenshot({ path: path.join(OUT, 'desktop-1-po-wheel-doleva.jpg'), quality: 70 });

  // 2. vodorovně doprava
  await sleep(GAP);
  a = await state(page);
  await gesture(page, [[-50, 0], [-50, 0], [-50, 0], [-50, 0]]);
  b = await state(page);
  log = await wheelLog(page);
  ok('wheel deltaX -200: pás ujede 200 px doprava', near(delta(a, b), 200, 3), delta(a, b).toFixed(1) + ' px');
  ok('wheel deltaX -200: defaultPrevented, stránka stojí', log.every(e => e.prevented) && b.scrollX === a.scrollX && b.scrollY === a.scrollY);

  // 3. smyčka navazuje: posun o víc než jednu délku seznamu, oběma směry
  await sleep(GAP);
  a = await state(page);
  const lap = Math.ceil((a.half + 400) / 400);
  await gesture(page, Array.from({ length: lap }, () => [400, 0]));
  b = await state(page);
  ok('smyčka doleva: po ' + lap * 400 + ' px pás dál kryje celý obal', b.covered && b.x <= 0 && b.x > -b.half, 'x ' + b.x.toFixed(0) + ', délka ' + b.half.toFixed(0));
  await sleep(GAP);
  await gesture(page, Array.from({ length: lap }, () => [-400, 0]));
  const c = await state(page);
  ok('smyčka doprava: pás se vrátí na stejné místo a kryje obal', c.covered && near(delta(a, c), 0, 3), 'rozdíl ' + delta(a, c).toFixed(1) + ' px');
  await wheelLog(page);

  // 4. svisle: stránka scrolluje, pás stojí
  await sleep(GAP);
  a = await state(page);
  await gesture(page, [[0, 60], [0, 60], [0, 60]]);
  await sleep(500);
  b = await state(page);
  log = await wheelLog(page);
  ok('svislý wheel: stránka scrolluje', b.scrollY - a.scrollY > 100, 'scrollY +' + (b.scrollY - a.scrollY).toFixed(0) + ' px');
  ok('svislý wheel: žádná událost není defaultPrevented', log.length === 3 && log.every(e => !e.prevented));
  ok('svislý wheel: pás se nepohnul', near(delta(a, b), 0, 1), delta(a, b).toFixed(1) + ' px');

  // 5. šikmo, převažuje vodorovná: zámek drží i přes svislejší konec gesta
  await toMarquee(page);
  await page.mouse.move(720, cy);
  await sleep(GAP);
  await wheelLog(page);
  a = await state(page);
  await gesture(page, [[80, 40], [60, 50], [20, 80], [0, 90]]);
  await sleep(400);
  b = await state(page);
  log = await wheelLog(page);
  ok('šikmé gesto s převahou X: pás ujede součet deltaX (160 px)', near(delta(a, b), -160, 3), delta(a, b).toFixed(1) + ' px');
  ok('šikmé gesto s převahou X: drží do konce, stránka stojí', log.every(e => e.prevented) && b.scrollY === a.scrollY, 'scrollY ' + a.scrollY + ' → ' + b.scrollY);

  // 6. šikmo, převažuje svislá: vodorovnější konec gesta pásem nehne
  await sleep(GAP);
  a = await state(page);
  await gesture(page, [[40, 80], [50, 60], [80, 20], [90, 0]]);
  await sleep(500);
  b = await state(page);
  log = await wheelLog(page);
  ok('šikmé gesto s převahou Y: pás se nepohnul', near(delta(a, b), 0, 1), delta(a, b).toFixed(1) + ' px');
  ok('šikmé gesto s převahou Y: nic není defaultPrevented, stránka scrolluje', log.every(e => !e.prevented) && b.scrollY > a.scrollY, 'scrollY +' + (b.scrollY - a.scrollY).toFixed(0) + ' px');

  // 7. Shift + kolečko
  await toMarquee(page);
  await page.mouse.move(720, cy);
  await sleep(GAP);
  await wheelLog(page);
  a = await state(page);
  await page.keyboard.down('Shift');
  await gesture(page, [[0, 100], [0, 100]]);
  await page.keyboard.up('Shift');
  b = await state(page);
  log = await wheelLog(page);
  ok('Shift + kolečko: pás ujede 200 px doleva', near(delta(a, b), -200, 3), delta(a, b).toFixed(1) + ' px, prohlížeč poslal ' + JSON.stringify(log[0]));
  ok('Shift + kolečko: defaultPrevented, stránka stojí', log.every(e => e.prevented) && b.scrollX === a.scrollX && b.scrollY === a.scrollY);
  await sleep(GAP);
  a = await state(page);
  await page.keyboard.down('Shift');
  await gesture(page, [[0, -100]]);
  await page.keyboard.up('Shift');
  b = await state(page);
  ok('Shift + kolečko nahoru: pás ujede 100 px doprava', near(delta(a, b), 100, 3), delta(a, b).toFixed(1) + ' px');

  // 8. kurzor zůstává nad pásem: hover má přednost, pás po gestu stojí
  await sleep(2500);
  const hoverSpeed = await speed(page, 600);
  ok('kurzor nad pásem: 2,5 s po gestu pás stojí (hover má přednost)', near(hoverSpeed, 0, 1), hoverSpeed.toFixed(1) + ' px/s');

  // 9. průběh rychlosti po konci gesta, kurzor pryč z pásu
  await wheelLog(page);
  await record(page, 5200);
  await gesture(page, [[60, 0], [60, 0], [60, 0]]);
  const end = (await state(page)).now - 120; // gesture() po poslední události čeká 120 ms
  await page.mouse.move(700, 20);
  const rec = await collect(page);
  const prof = profile(rec, end);
  const rest = prof.slice(0, 9); // 0–0,9 s po poslední události
  const ramp = prof.slice(9);
  let jump = 0;
  for (let i = 1; i < prof.length; i++) jump = Math.max(jump, Math.abs(prof[i] - prof[i - 1]));
  const tail = prof.slice(-5);
  ok('po gestu: 0–0,9 s pás stojí', rest.every(v => Math.abs(v) < 1.5), rest.map(v => v.toFixed(0)).join(' '));
  ok('po gestu: pak plynulý náběh, největší změna mezi okny 100 ms', jump < 12, jump.toFixed(1) + ' px/s; ' + ramp.map(v => v.toFixed(0)).join(' '));
  ok('po gestu: náběh je monotónní (rychlost jen roste směrem k -40)', ramp.every((v, i) => i === 0 || v <= ramp[i - 1] + 1.5));
  ok('po gestu: konec na běžné rychlosti -40 px/s', tail.every(v => near(v, -40, 3)), tail.map(v => v.toFixed(1)).join(' '));

  ok('bez chyb v konzoli', errors.length === 0, errors.join(' | '));
  await context.close();
}

async function keyboard(browser) {
  console.log('\nDesktop 1440, klávesnice — ' + BASE + '/');
  const { context, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } }, BASE + '/');
  await toMarquee(page);
  await page.mouse.move(700, 20);
  await sleep(1200);

  // Fokus na první kartu, která je celá vidět. Předchozí stisk klávesy
  // přepne prohlížeč do režimu klávesnice (:focus-visible).
  await page.keyboard.press('Shift');
  const info = await page.evaluate(() => {
    const root = document.querySelector('.testimonial21_marquee');
    const cards = [...root.querySelectorAll('a')];
    const step = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    const card = cards.find(c => c.getBoundingClientRect().left > 40 && !c.closest('[aria-hidden="true"]')) || cards[0];
    card.focus({ preventScroll: true });
    return { step, cards: cards.length, index: cards.indexOf(card), focusVisible: card.matches(':focus-visible'), width: cards[0].getBoundingClientRect().width };
  });
  ok('krok = rozteč karet', info.step > 100, info.step.toFixed(1) + ' px (karta ' + info.width.toFixed(0) + ' px), fokus na kartě č. ' + (info.index + 1));
  await sleep(1800);
  const still = await speed(page, 500);
  ok('fokus z klávesnice pás zastaví', near(still, 0, 1), still.toFixed(1) + ' px/s, :focus-visible ' + info.focusVisible);

  const press = async key => {
    const a = await state(page);
    await record(page, 900);
    await page.keyboard.press(key);
    const rec = await collect(page);
    const b = await state(page);
    let biggest = 0;
    let moving = 0;
    for (let i = 1; i < rec.frames.length; i++) {
      let d = rec.frames[i][1] - rec.frames[i - 1][1];
      if (d > rec.half / 2) d -= rec.half;
      if (d < -rec.half / 2) d += rec.half;
      biggest = Math.max(biggest, Math.abs(d));
      if (Math.abs(d) > 0.3) moving += rec.frames[i][0] - rec.frames[i - 1][0];
    }
    return { moved: delta(a, b), biggest, moving, scrollX: b.scrollX - a.scrollX, scrollY: b.scrollY - a.scrollY };
  };

  let r = await press('ArrowRight');
  ok('šipka vpravo: pás ujede o jednu kartu doleva', near(r.moved, -info.step, 2), r.moved.toFixed(1) + ' px');
  ok('šipka vpravo: plynule, ne skokem', r.biggest < info.step * 0.25 && r.moving > 200, 'největší krok za snímek ' + r.biggest.toFixed(0) + ' px, pohyb trval ' + r.moving.toFixed(0) + ' ms');
  ok('šipka vpravo: stránka se nehnula', r.scrollX === 0 && r.scrollY === 0);
  await page.screenshot({ path: path.join(OUT, 'desktop-2-po-sipce-vpravo.jpg'), quality: 70 });

  r = await press('ArrowLeft');
  ok('šipka vlevo: pás ujede o jednu kartu doprava', near(r.moved, info.step, 2), r.moved.toFixed(1) + ' px');
  ok('šipka vlevo: plynule, ne skokem', r.biggest < info.step * 0.25 && r.moving > 200, 'největší krok za snímek ' + r.biggest.toFixed(0) + ' px, pohyb trval ' + r.moving.toFixed(0) + ' ms');

  // Dva rychlé stisky se sečtou.
  const a = await state(page);
  await page.keyboard.press('ArrowRight');
  await sleep(60);
  await page.keyboard.press('ArrowRight');
  await sleep(1000);
  const b = await state(page);
  ok('dva rychlé stisky: pás ujede o dvě karty', near(delta(a, b), -2 * info.step, 3), delta(a, b).toFixed(1) + ' px');

  // Tab dál chodí po kartách.
  const before = await page.evaluate(() => [...document.querySelectorAll('.testimonial21_marquee a')].indexOf(document.activeElement));
  await page.keyboard.press('Tab');
  const after = await page.evaluate(() => [...document.querySelectorAll('.testimonial21_marquee a')].indexOf(document.activeElement));
  ok('Tab přejde na další kartu', after === before + 1, 'karta č. ' + (before + 1) + ' → ' + (after + 1));

  // Fokus pryč: pauza a rozjezd jako po gestu.
  await page.keyboard.press('ArrowRight');
  await sleep(700);
  await record(page, 4600);
  const t0 = (await state(page)).now;
  await page.evaluate(() => document.activeElement.blur());
  const prof = profile(await collect(page), t0);
  let jump = 0;
  for (let i = 1; i < prof.length; i++) jump = Math.max(jump, Math.abs(prof[i] - prof[i - 1]));
  ok('po opuštění pásu: plynulý rozjezd na -40 px/s', jump < 12 && near(prof[prof.length - 1], -40, 3), 'největší změna ' + jump.toFixed(1) + ' px/s; ' + prof.map(v => v.toFixed(0)).join(' '));

  ok('bez chyb v konzoli', errors.length === 0, errors.join(' | '));
  await context.close();
}

async function reducedMotion(browser) {
  console.log('\nprefers-reduced-motion — ' + BASE + '/');
  const { context, page } = await open(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, BASE + '/');
  await toMarquee(page);
  const s = await state(page);
  await page.mouse.move(720, s.box.top + s.box.height / 2);
  await wheelLog(page);
  await gesture(page, [[120, 0]]);
  await sleep(300);
  const log = await wheelLog(page);
  const r = await page.evaluate(() => {
    const root = document.querySelector('.testimonial21_marquee');
    return { ready: root.hasAttribute('data-marquee-ready'), scrollLeft: root.scrollLeft, transform: root.firstElementChild.style.transform };
  });
  ok('reduced motion: modul wheel nezachytává, pás scrolluje nativně', !r.ready && !r.transform && log.every(e => !e.prevented) && r.scrollLeft > 0, 'scrollLeft ' + r.scrollLeft);
  await context.close();
}

// Surové HTML: co se načítá, hlavička, recenze ve třech jazycích.
async function html(browser) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  for (const loc of ['/', '/en', '/de']) {
    console.log('\nHTML — ' + BASE + loc);
    const res = await context.request.get(BASE + loc);
    const src = await res.text();
    const pin = /eldr@([0-9a-f]{7,40})\/src\/dev\/testimonial-marquee\.js/.exec(src);
    ok(loc + ': připnutý commit pásu', !!pin, pin ? pin[1] : 'nenalezen');
    const fs5 = ['cmsfilter', 'richtext', 'scrolldisable', 'attributes@2', 'cookie-consent'].filter(n => src.includes(n));
    ok(loc + ': v head GTM-W6PR2VX a 5 Finsweet', src.includes('GTM-W6PR2VX') && fs5.length === 5, fs5.join(', '));
    const start = src.indexOf('testimonial21_marquee');
    const list = src.slice(start, src.indexOf('aria-hidden="true"', start));
    const cards = (list.match(/role="listitem"/g) || []).length;
    ok(loc + ': 22 recenzí v HTML bez JS', cards === 22, cards + ' položek v prvním seznamu');
  }
  await context.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  try {
    await wheel(browser);
    await keyboard(browser);
    await reducedMotion(browser);
    await html(browser);
  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (results.length - failed.length) + ' prošlo, ' + failed.length + ' selhalo');
  fs.writeFileSync(path.join(OUT, 'vysledky.json'), JSON.stringify({ base: BASE, local: LOCAL, kdy: new Date().toISOString(), results }, null, 2) + '\n');
  process.exit(failed.length ? 1 : 0);
})();
