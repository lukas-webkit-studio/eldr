#!/usr/bin/env node
/* S12 #66: ověření horního pruhu (2. kolo) na stagingu.

   node scripts/overeni/s12-horni-pruh.js [--base https://eldr.webflow.io]
        [--local] [--out docs/snimky/s12]

   --local  místo skriptu z jsDelivr podstrčí src/dev/announcement-bar.js
            z pracovního adresáře (kontrola před merge).
   Potřebuje Playwright s Chromiem (v cloudové session je globálně).

   Kontroluje: text CS/EN/DE (jedna zpráva, rozhodnutí Lukáše 20. 11.) v surovém HTML,
   výšku a řádky pruhu na 1440/991/768/390/360, křížek u prvního řádku,
   vdovy, ghost tlačítko a kontrast (i v hoveru), odjetí pruhu při scrollu
   na pěti stránkách s měřením layout-shift, skok na #formular, zavření
   v localStorage přes nový kontext, stav bez JS a head.
   Cookie lišta se na snímcích schovává. */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };
const BASE = opt('--base') || 'https://eldr.webflow.io';
const OUT = path.resolve(opt('--out') || 'docs/snimky/s12');
const LOCAL = args.includes('--local');
const DEV_FILE = path.join(__dirname, '..', '..', 'src', 'dev', 'announcement-bar.js');
const HIDE_COOKIES = '.cookiesconsent{display:none!important}';

const LANGS = {
  cs: { prefix: '', text: 'Objednejte do 31. 12. a zamkněte si letošní ceny', cta: 'Zamluvit termín' },
  en: { prefix: '/en', text: 'Order by 31 Dec and lock in this year’s prices', cta: 'Book a date' },
  de: { prefix: '/de', text: 'Bestellen Sie bis 31.12. zu diesjährigen Preisen', cta: 'Termin reservieren' }
};
const PAGES = ['/', '/produkty/tabule-a-svetelne-panely', '/kontakty', '/inspirace', '/inspirace/3d-napis-jak-ziskat-pozornost-zakazniku'];

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✅ ' : '  ❌ ') + name + (detail ? '  (' + detail + ')' : ''));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, url, options = {}, ctx) {
  const context = ctx || await browser.newContext({ ignoreHTTPSErrors: true, ...options });
  if (!ctx) {
    if (LOCAL) {
      await context.route(/cdn\.jsdelivr\.net\/gh\/lukas-webkit-studio\/eldr@[^/]+\/src\/dev\/announcement-bar\.js/, r =>
        r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(DEV_FILE, 'utf8') }));
    }
    await context.route(/leady\.com|challenges\.cloudflare\.com|googletagmanager\.com/, r => r.abort());
  }
  const page = await context.newPage();
  // Layout shift se sbírá od začátku načtení, ať jde odlišit načtení od scrollu.
  await page.addInitScript(() => {
    window.__shifts = [];
    try {
      new PerformanceObserver(l => l.getEntries().forEach(e => window.__shifts.push({ v: e.value, t: e.startTime, input: e.hadRecentInput })))
        .observe({ type: 'layout-shift', buffered: true });
    } catch (e) { /* bez podpory */ }
  });
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  if (options.javaScriptEnabled !== false) {
    await page.waitForFunction(() => document.querySelector('.announcement_component[data-announcement-ready]'), null, { timeout: 15000 }).catch(() => {});
    await page.addStyleTag({ content: HIDE_COOKIES });
  }
  await sleep(900);
  return { context, page };
}

// Řádky textu v prvku: počet různých horních hran řádkových boxů.
const LINES_FN = `el => {
  const r = document.createRange(); r.selectNodeContents(el);
  const tops = []; for (const b of r.getClientRects()) { if (b.width < 1) continue; if (!tops.some(t => Math.abs(t - b.top) < 4)) tops.push(b.top); }
  return tops.length;
}`;

async function texts() {
  console.log('\nTexty v publikovaném HTML');
  for (const [lang, t] of Object.entries(LANGS)) {
    const html = await (await fetch(BASE + t.prefix + '/?nc=' + Date.now())).text();
    const plain = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const sets = [...html.matchAll(/<div class="announcement_messages[^"]*">([\s\S]*?)<\/div>/g)]
      .map(m => [...m[1].matchAll(/<p class="announcement_text">([\s\S]*?)<\/p>/g)].map(x => plain(x[1])));
    ok(`${lang}: jedna sada, jedna zpráva „${t.text}“`, sets.length === 1 && JSON.stringify(sets[0]) === JSON.stringify([t.text]), JSON.stringify(sets));
    ok(`${lang}: výzva „${t.cta}“`, html.includes(`announcement_cta-text">${t.cta}<`));
  }
}

async function layout(browser) {
  console.log('\nRozložení po šířkách');
  for (const [lang, t] of Object.entries(LANGS)) {
    for (const w of [1440, 991, 768, 390, 360]) {
      const { context, page } = await open(browser, t.prefix + '/', { viewport: { width: w, height: 844 } });
      const m = await page.evaluate(`(() => {
        const lines = ${LINES_FN};
        const bar = document.querySelector('.announcement_component');
        const sets = [...bar.querySelectorAll('.announcement_messages')].filter(s => getComputedStyle(s).display !== 'none');
        const texts = sets.length === 1 ? [...sets[0].querySelectorAll('.announcement_text')] : [];
        const per = texts.map(el => {
          // změřit každou zprávu zvlášť: ostatní dočasně schovat
          const saved = texts.map(x => [x.style.display, x.style.transform]);
          texts.forEach(x => { x.style.display = x === el ? 'block' : 'none'; x.style.transform = 'none'; });
          const n = lines(el);
          const r = document.createRange(); r.selectNodeContents(el);
          const rects = [...r.getClientRects()].filter(b => b.width > 1);
          const lastTop = Math.max(...rects.map(b => b.top));
          const lastW = rects.filter(b => Math.abs(b.top - lastTop) < 4).reduce((a, b) => a + b.width, 0);
          const firstTop = Math.min(...rects.map(b => b.top));
          const firstW = rects.filter(b => Math.abs(b.top - firstTop) < 4).reduce((a, b) => a + b.width, 0);
          const right = Math.max(...rects.map(b => b.right));
          const lineMid = firstTop + parseFloat(getComputedStyle(el).lineHeight) / 2;
          const h = bar.getBoundingClientRect().height;
          texts.forEach((x, i) => { x.style.display = saved[i][0]; x.style.transform = saved[i][1]; });
          return { n, lastW, firstW, right, lineMid, h, words: el.textContent.trim().split(/\\s+/) };
        });
        const cta = bar.querySelector('.announcement_cta').getBoundingClientRect();
        const glyph = bar.querySelector('.announcement_close span').getBoundingClientRect();
        const close = bar.querySelector('.announcement_close').getBoundingClientRect();
        return { per, cta: { top: cta.top, h: cta.height, left: cta.left }, glyphMid: glyph.top + glyph.height / 2, closeLeft: close.left,
          barH: Math.max(...per.map(p => p.h)), shortShown: sets[0] && sets[0].classList.contains('is-short') };
      })()`);
      const tag = `${w} ${lang}`;
      if (w <= 767) {
        ok(`${tag}: pruh ≤ 60 px`, m.barH <= 60, `${Math.round(m.barH)} px`);
        ok(`${tag}: nejvýš 2 řádky (zpráva 1 + výzva)`, m.per.every(p => p.n === 1) && m.cta.top > Math.max(...m.per.map(p => p.lineMid)), m.per.map(p => p.n).join('/'));
        ok(`${tag}: křížek u prvního řádku`, m.per.every(p => Math.abs(p.lineMid - m.glyphMid) <= 4), `řádky ${m.per.map(p => p.lineMid.toFixed(1)).join('/')}, křížek ${m.glyphMid.toFixed(1)}`);
      } else {
        ok(`${tag}: jeden řádek`, m.per.every(p => p.n === 1), m.per.map(p => p.n).join('/'));
        ok(`${tag}: výzva vedle textu, ne pod ním`, m.per.every(p => m.cta.left >= p.right - 1));
      }
      ok(`${tag}: text nepřekrývá křížek`, m.per.every(p => p.right <= m.closeLeft + 0.5), `text do ${Math.round(Math.max(...m.per.map(p => p.right)))}, křížek od ${Math.round(m.closeLeft)}`);
      ok(`${tag}: bez vdov`, m.per.every(p => p.n === 1 || p.lastW >= p.firstW * 0.3));
      await context.close();
    }
  }
}

function contrast(a, b) {
  const L = c => {
    const [r, g, bl] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

async function button(browser) {
  console.log('\nVýzva jako ghost tlačítko');
  const { context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } });
  const read = () => page.evaluate(() => {
    const c = document.querySelector('.announcement_cta');
    const s = getComputedStyle(c);
    const bar = getComputedStyle(document.querySelector('.announcement_component'));
    const r = c.getBoundingClientRect();
    return { color: s.color, bg: s.backgroundColor, barBg: bar.backgroundColor, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      radius: s.borderTopLeftRadius, weight: s.fontWeight, h: r.height, width: r.width, padding: s.paddingTop + ' ' + s.paddingLeft };
  });
  const a = await read();
  ok('obrys bílý (ve Webflow 1,5 px, Chromium na 1× hustotě kreslí 1 px), rohy 2 px jako tlačítka webu', /^1(\.5)?px solid rgb\(255, 255, 255\)/.test(a.border) && a.radius === '2px', a.border + ', ' + a.radius);
  ok('text 600, výška ~28 px, padding 4 × 12', a.weight === '600' && a.h >= 27 && a.h <= 32 && a.padding === '4px 12px', `${a.weight}, ${Math.round(a.h)} px, ${a.padding}`);
  ok('kontrast bílá na červené ≥ 4,5 : 1', contrast(a.color, a.barBg) >= 4.5, contrast(a.color, a.barBg).toFixed(2) + ' : 1');
  await page.hover('.announcement_cta');
  await sleep(450);
  const b = await read();
  ok('hover: bílé pozadí, červený text', b.bg === 'rgb(255, 255, 255)' && b.color !== 'rgb(255, 255, 255)', `${b.bg} / ${b.color}`);
  ok('hover: kontrast červená na bílé ≥ 4,5 : 1', contrast(b.color, b.bg) >= 4.5, contrast(b.color, b.bg).toFixed(2) + ' : 1');
  ok('hover: šířka tlačítka se nemění (šipka se posune uvnitř)', Math.abs(b.width - a.width) < 1, `${a.width.toFixed(1)} → ${b.width.toFixed(1)}`);
  await page.mouse.move(5, 600);
  await page.keyboard.press('Tab');
  await sleep(200);
  const f = await page.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return { cls: el.className, outline: s.outlineStyle + ' ' + s.outlineWidth };
  });
  ok('focus-visible: obrys na odkazu pruhu (první prvek v tabulátoru)', /announcement_link/.test(f.cls) && /solid 2px/.test(f.outline), f.cls + ' · ' + f.outline);
  await page.screenshot({ path: path.join(OUT, '1440-cs-fokus.png'), clip: { x: 0, y: 0, width: 1440, height: 140 } });
  await context.close();
}

async function scrolling(browser) {
  console.log('\nOdjetí pruhu při scrollu a layout shift');
  for (const w of [1440, 390]) {
    for (const url of PAGES) {
      const { context, page } = await open(browser, url, { viewport: { width: w, height: 844 } });
      const state = () => page.evaluate(() => {
        const bar = document.querySelector('.announcement_component').getBoundingClientRect();
        const nav = document.querySelector('.navbar_container').getBoundingClientRect();
        return { barTop: bar.top, barBottom: bar.bottom, barH: bar.height, navTop: nav.top, y: window.scrollY };
      });
      const top = await state();
      const before = await page.evaluate(() => window.__shifts.length);
      for (const y of [10, 25, 60, 200, 900]) { await page.evaluate(y => window.scrollTo(0, y), y); await sleep(120); }
      const down = await state();
      await page.evaluate(() => window.scrollTo(0, 500)); await sleep(150);
      const midUp = await state();
      for (const y of [200, 40, 0]) { await page.evaluate(y => window.scrollTo(0, y), y); await sleep(120); }
      const back = await state();
      const shifts = await page.evaluate(n => window.__shifts.slice(n).reduce((a, s) => a + s.v, 0), before);
      const tag = `${w} ${url}`;
      ok(`${tag}: nahoře pruh vidět, navigace pod ním`, Math.abs(top.barTop) < 1 && Math.abs(top.navTop - top.barH) < 2, `pruh ${Math.round(top.barH)} px, nav ${Math.round(top.navTop)}`);
      ok(`${tag}: po scrollu dolů pruh pryč, navigace u horní hrany`, down.barBottom <= 0.5 && Math.abs(down.navTop) < 1, `nav ${down.navTop.toFixed(1)}`);
      ok(`${tag}: scroll nahoru uprostřed stránky pruh neukáže`, midUp.barBottom <= 0.5);
      ok(`${tag}: zpátky nahoře pruh znovu vidět`, Math.abs(back.barTop) < 1 && Math.abs(back.navTop - back.barH) < 2);
      ok(`${tag}: layout shift při scrollu 0`, shifts < 0.001, shifts.toFixed(4));
      await context.close();
    }
  }
}

async function formLink(browser) {
  console.log('\nKlik vede na formulář, nadpis pod navigací');
  for (const [lang, t] of Object.entries(LANGS)) {
    for (const w of [1440, 390]) {
      const { context, page } = await open(browser, t.prefix + '/', { viewport: { width: w, height: 844 } });
      await Promise.all([page.waitForURL(/kontakty#formular/, { waitUntil: 'domcontentloaded' }), page.click('.announcement_link')]);
      await page.addStyleTag({ content: HIDE_COOKIES });
      await sleep(1500);
      const r = await page.evaluate(() => {
        const f = document.getElementById('formular');
        const nav = document.querySelector('.navbar_container').getBoundingClientRect();
        const h = f.querySelector('h2, h3, form');
        return { url: location.pathname + location.hash, head: h.getBoundingClientRect().top, navBottom: nav.bottom };
      });
      ok(`${w} ${lang}: ${r.url}, nadpis formuláře pod navigací`, r.url === t.prefix + '/kontakty#formular' && r.head >= r.navBottom,
        `nadpis ${Math.round(r.head)}, navigace končí ${Math.round(r.navBottom)}`);
      if (w === 390 && lang === 'cs') await page.screenshot({ path: path.join(OUT, '390-cs-formular.png') });
      await context.close();
    }
  }
}

async function behaviour(browser) {
  console.log('\nZavření, rotace, bez JS');
  // Zavření: nový kontext se stejným úložištěm = prohlížeč zavřený a znovu otevřený.
  let { context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } });
  await page.click('.announcement_close');
  await sleep(300);
  const key = await page.evaluate(() => localStorage.getItem('eldr-announcement-closed:zima-2026'));
  const session = await page.evaluate(() => sessionStorage.getItem('eldr-announcement-closed:zima-2026'));
  ok('zavření zapsáno do localStorage (ne sessionStorage)', key === '1' && session === null);
  const storage = await context.storageState();
  await context.close();
  const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, storageState: storage });
  if (LOCAL) await ctx2.route(/cdn\.jsdelivr\.net\/gh\/lukas-webkit-studio\/eldr@[^/]+\/src\/dev\/announcement-bar\.js/, r =>
    r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(DEV_FILE, 'utf8') }));
  await ctx2.route(/leady\.com|challenges\.cloudflare\.com|googletagmanager\.com/, r => r.abort());
  ({ page } = await open(browser, '/', {}, ctx2));
  const hidden = await page.evaluate(() => ({ d: document.querySelector('.announcement_component').style.display, pad: document.body.style.paddingTop, nav: document.querySelector('.navbar_container').getBoundingClientRect().top }));
  ok('po novém otevření prohlížeče pruh zůstává zavřený, navigace nahoře', hidden.d === 'none' && hidden.pad === '0px' && Math.abs(hidden.nav) < 1, JSON.stringify(hidden));
  await page.evaluate(() => window.scrollTo(0, 600)); await sleep(150);
  ok('zavřený pruh: scroll navigací nehýbe', await page.evaluate(() => document.querySelector('.navbar_component').style.transform === ''));
  await ctx2.close();

  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } }));
  await sleep(5600);
  const single = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.announcement_text')];
    return { n: t.length, visible: t[0] && getComputedStyle(t[0]).display !== 'none' && t[0].style.opacity !== '0' };
  });
  ok('jedna zpráva, bez rotace, po 5 s pořád vidět', single.n === 1 && single.visible, JSON.stringify(single));
  await context.close();

  ({ context, page } = await open(browser, '/', { viewport: { width: 390, height: 844 }, javaScriptEnabled: false }));
  const nojs = await page.evaluate(() => {
    const bar = document.querySelector('.announcement_component');
    const shown = [...bar.querySelectorAll('.announcement_text')].filter(e => e.offsetParent);
    return { n: shown.length, text: shown.map(e => e.textContent.trim()), h: bar.getBoundingClientRect().height, pad: parseFloat(getComputedStyle(document.body).paddingTop) };
  });
  ok('bez JS: zpráva vidět, odsazení obsahu kryje pruh', nojs.n === 1 && nojs.text[0] === LANGS.cs.text && nojs.pad >= nojs.h - 1, `${nojs.text[0]}, pruh ${Math.round(nojs.h)}, body ${nojs.pad}`);
  await context.close();
}

async function head() {
  console.log('\nHead a footer v publikovaném HTML');
  for (const [lang, t] of Object.entries(LANGS)) {
    const html = await (await fetch(BASE + t.prefix + '/?nc=' + Date.now())).text();
    const fin = ['attributes-scrolldisable', 'attributes-richtext', 'attributes-cmsfilter', 'attributes@2', 'cookie-consent'].filter(s => html.includes(s));
    const pin = (html.match(/eldr@([0-9a-f]{40})\/src\/dev\/announcement-bar\.js/) || [])[1];
    ok(`${lang}: GTM-W6PR2VX, 5 Finsweet, pruh s připnutým commitem`, html.includes('GTM-W6PR2VX') && fin.length === 5 && !!pin, `Finsweet ${fin.length}, commit ${pin || 'chybí'}`);
  }
}

async function shots(browser) {
  console.log('\nSnímky (nahoře a po scrollu)');
  for (const [lang, t] of Object.entries(LANGS)) {
    for (const w of [1440, 768, 390, 360]) {
      const { context, page } = await open(browser, t.prefix + '/', { viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
      await page.mouse.move(w - 5, 800);
      const clip = { x: 0, y: 0, width: w, height: w > 767 ? 200 : 220 };
      await page.screenshot({ path: path.join(OUT, `${w}-${lang}-nahore.png`), clip });
      await page.evaluate(() => window.scrollTo(0, 700)); await sleep(300);
      await page.screenshot({ path: path.join(OUT, `${w}-${lang}-scroll.png`), clip });
      await context.close();
    }
  }
  console.log('  uloženo do ' + path.relative(process.cwd(), OUT));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    await texts();
    await layout(browser);
    await button(browser);
    await scrolling(browser);
    await formLink(browser);
    await behaviour(browser);
    await head();
    if (!args.includes('--no-shots')) await shots(browser);
  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.pass);
  fs.writeFileSync(path.join(OUT, 'vysledky.json'), JSON.stringify({ base: BASE, local: LOCAL, date: new Date().toISOString(), results }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} prošlo`);
  process.exit(failed.length ? 1 : 0);
})();
