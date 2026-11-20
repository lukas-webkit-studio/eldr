#!/usr/bin/env node
/* S11 #62: ověření horního pruhu s akcí na stagingu.

   node scripts/overeni/s11-horni-pruh.js [--base https://eldr.webflow.io]
        [--local] [--out docs/snimky/s11]

   --local  místo skriptu z jsDelivr podstrčí src/dev/announcement-bar.js
            z pracovního adresáře (kontrola před merge).
   Potřebuje Playwright s Chromiem (v repu není, v cloudové session je
   nainstalovaný globálně). Výstup: tabulka kontrol, snímky, vysledky.json.

   Kontroluje: texty CS/EN/DE, jeden řádek na desktopu a tabletu, nejvýš dva
   na mobilu, křížek nepřekrývá text, odsazení obsahu na pěti stránkách,
   zavření a paměť v relaci, rotaci, pauzu při hoveru a fokusu, reduced
   motion, konec akce (podvržené hodiny), stav bez JS, odkaz na formulář
   a head (GTM a Finsweet). Cookie lišta se schovává, překrývá obsah. */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const BASE = opt('--base') || 'https://eldr.webflow.io';
const OUT = path.resolve(opt('--out') || 'docs/snimky/s11');
const LOCAL = args.includes('--local');
const DEV_FILE = path.join(__dirname, '..', '..', 'src', 'dev', 'announcement-bar.js');

const TEXTS = {
  cs: { first: 'Objednejte do 31. 12. a zamkněte si letošní ceny', cta: 'Zamluvit termín', close: 'Zavřít oznámení', prefix: '' },
  en: { first: 'Order by 31 December and lock in this year’s prices', cta: 'Book a date', close: 'Close announcement', prefix: '/en' },
  de: { first: 'Bestellen Sie bis zum 31.12. und sichern Sie sich die diesjährigen Preise', cta: 'Termin reservieren', close: 'Hinweis schließen', prefix: '/de' }
};
const WIDTHS = [1440, 991, 390];
const HIDE_COOKIES = '.cookiesconsent{display:none!important}';

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✅ ' : '  ❌ ') + name + (detail ? '  (' + detail + ')' : ''));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, url, options = {}, before) {
  // ignoreHTTPSErrors: cloudová session jde ven přes proxy s vlastní certifikační autoritou.
  const context = await browser.newContext({ ignoreHTTPSErrors: true, ...options });
  if (LOCAL) {
    await context.route(/cdn\.jsdelivr\.net\/gh\/lukas-webkit-studio\/eldr@[^/]+\/src\/dev\/announcement-bar\.js/, route =>
      route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(DEV_FILE, 'utf8') })
    );
  }
  // Měřicí skripty třetích stran (Leady, Cloudflare challenge) s pruhem nesouvisí a zdržují načtení.
  await context.route(/leady\.com|challenges\.cloudflare\.com|googletagmanager\.com/, route => route.abort());
  const page = await context.newPage();
  if (before) await before(page);
  const errors = [];
  // Turnstile u formuláře padá jen proto, že challenges.cloudflare.com výš blokujeme.
  page.on('pageerror', e => { if (!/turnstile/i.test(e.message)) errors.push(e.message); });
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  if (options.javaScriptEnabled !== false) {
    await page.waitForFunction(() => document.querySelector('.announcement_component[data-announcement-ready]'), null, { timeout: 15000 }).catch(() => {});
  }
  // Bez JS addStyleTag neprojde; cookie lišta měření bez JS nevadí.
  if (options.javaScriptEnabled !== false) await page.addStyleTag({ content: HIDE_COOKIES });
  await sleep(800);
  return { context, page, errors };
}

// Stav pruhu a rozvržení v jednom měření.
const measure = page => page.evaluate(() => {
  const bar = document.querySelector('.announcement_component');
  if (!bar) return null;
  const r = el => el.getBoundingClientRect();
  const msgs = [...bar.querySelectorAll('.announcement_text')];
  // Počet řádků každé zprávy: počet různých horních hran řádkových boxů textu.
  const lines = msgs.map(m => {
    const range = document.createRange();
    range.selectNodeContents(m);
    const tops = new Set([...range.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top)));
    return tops.size;
  });
  const close = bar.querySelector('.announcement_close');
  const cta = bar.querySelector('.announcement_cta');
  const box = bar.querySelector('.announcement_messages');
  const nav = document.querySelector('.navbar_container');
  // Aktivní = cílový stav rotace (inline opacity 1). Vypočtená opacity by
  // během 400ms prolnutí ukazovala i odcházející zprávu.
  const active = msgs.findIndex(m => m.style.opacity === '1');
  return {
    shown: getComputedStyle(bar).display !== 'none',
    barH: r(bar).height,
    bodyPad: parseFloat(getComputedStyle(document.body).paddingTop),
    navTop: r(nav).top,
    navBottom: r(document.querySelector('.navbar_component')).bottom,
    first: msgs[0] ? msgs[0].textContent.replace(/\s+/g, ' ').trim() : '',
    lines,
    active,
    transitions: msgs.map(m => m.style.transition),
    href: bar.querySelector('.announcement_link').getAttribute('href'),
    cta: cta.innerText.replace(/\s+/g, ' ').trim(),
    ctaRight: r(cta).right,
    textLeft: Math.min(r(box).left, r(cta).left),
    textRight: Math.max(r(box).right, r(cta).right),
    barRight: r(bar).right,
    closeShown: getComputedStyle(close).display !== 'none',
    closeLeft: r(close).left,
    closeW: r(close).width,
    closeH: r(close).height,
    closeName: close.textContent.replace('×', '').trim(),
    // Řádky celého pruhu: zpráva + výzva podle různých horních hran.
    barLines: (() => {
      const range = document.createRange();
      const tops = [];
      [msgs[active >= 0 ? active : 0], cta].forEach(el => { range.selectNodeContents(el); [...range.getClientRects()].filter(x => x.width > 0).forEach(x => tops.push(x.top)); });
      // Řádkové boxy na stejném řádku se liší o pár px, nový řádek je o výšku řádku níž.
      return tops.sort((a, b) => a - b).filter((t, i, a) => i === 0 || t - a[i - 1] > 8).length;
    })(),
    colors: [msgs[0], msgs[0].querySelector('strong'), cta].filter(Boolean).map(el => getComputedStyle(el).color),
    dot: bar.querySelector('.announcement_dot') ? getComputedStyle(bar.querySelector('.announcement_dot')).backgroundColor : 'chybí'
  };
});

async function layout(browser) {
  console.log('\nTexty a rozvržení (homepage, 1440 / 991 / 390 × CS / EN / DE)');
  for (const lang of Object.keys(TEXTS)) {
    for (const w of WIDTHS) {
      const t = TEXTS[lang];
      const { context, page, errors } = await open(browser, t.prefix + '/', { viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
      const m = await measure(page);
      const tag = `${w} ${lang}`;
      // Na mobilu zpráva nejvýš 2 řádky a výzva celým textem na vlastním řádku = pruh nejvýš 3 řádky.
      const maxLines = w <= 767 ? 2 : 1;
      ok(`${tag}: bez chyb v konzoli`, errors.length === 0, errors.join('; '));
      ok(`${tag}: první zpráva podle zadání`, m.first === t.first, m.first);
      ok(`${tag}: zprávy na ${maxLines === 1 ? 'jednom řádku' : 'nejvýš dvou řádcích'}`, Math.max(...m.lines) <= maxLines, 'řádky ' + m.lines.join('/'));
      ok(`${tag}: výzva celým textem „${t.cta} →“`, m.cta === t.cta + ' →', m.cta);
      ok(`${tag}: pruh nejvýš ${w <= 767 ? 3 : 1} řádky textu`, m.barLines <= (w <= 767 ? 3 : 1), m.barLines + ' ř.');
      ok(`${tag}: všechen text bíle, žlutá jen tečka`, m.colors.every(c => c === 'rgb(255, 255, 255)') && m.dot === 'rgb(249, 179, 25)', m.colors.join(', ') + ' / tečka ' + m.dot);
      ok(`${tag}: křížek 44 × 44 px a nepřekrývá text`, m.closeShown && m.closeW >= 44 && m.closeH >= 44 && m.textRight <= m.closeLeft,
        `text do ${Math.round(m.textRight)}, křížek od ${Math.round(m.closeLeft)}`);
      ok(`${tag}: nic se neusekne (text uvnitř pruhu)`, m.textLeft >= 0 && m.textRight <= m.barRight);
      ok(`${tag}: popisek křížku přeložený`, m.closeName === t.close, m.closeName);
      ok(`${tag}: odkaz na formulář v jazyce stránky`, m.href === t.prefix + '/kontakty#formular', m.href);
      ok(`${tag}: odsazení body = výška pruhu, navigace pod pruhem`,
        Math.abs(m.bodyPad - m.barH) < 1 && Math.abs(m.navTop - m.barH) < 1, `pruh ${m.barH} px, body ${m.bodyPad} px`);
      await page.screenshot({ path: path.join(OUT, `${w}-${lang}.png`), clip: { x: 0, y: 0, width: w, height: w <= 767 ? 260 : 220 } });
      await context.close();
    }
  }
}

const PAGES = ['/', '/produkty/tabule-a-svetelne-panely', '/kontakty', '/inspirace', '/inspirace/3d-napis-jak-ziskat-pozornost-zakazniku'];

async function offsets(browser) {
  console.log('\nZačátek obsahu není překrytý (5 stránek, 1440 a 390, CS)');
  for (const w of [1440, 390]) {
    for (const url of PAGES) {
      const { context, page } = await open(browser, url, { viewport: { width: w, height: 900 } });
      const firstTop = () => page.evaluate(() => {
        const h = [...document.querySelectorAll('h1, h2')].find(el => el.offsetParent && !el.closest('.navbar_component'));
        return h ? h.getBoundingClientRect().top : null;
      });
      const m = await measure(page);
      const before = await firstTop();
      ok(`${w} ${url}: první nadpis pod navigací`, before !== null && before >= m.navBottom, `nadpis ${Math.round(before)}, navigace končí ${Math.round(m.navBottom)}`);
      await page.click('.announcement_close');
      await sleep(100);
      const after = await firstTop();
      const m2 = await measure(page);
      ok(`${w} ${url}: po zavření se obsah vrátí o výšku pruhu a navigace je nahoře`,
        Math.abs(before - after - m.barH) < 1.5 && Math.abs(m2.navTop) < 1 && m2.bodyPad === 0,
        `posun ${Math.round(before - after)} px, navigace ${Math.round(m2.navTop)} px`);
      if (w === 1440 && url === '/') await page.screenshot({ path: path.join(OUT, '1440-cs-po-zavreni.png'), clip: { x: 0, y: 0, width: w, height: 220 } });
      await context.close();
    }
  }
}

async function behaviour(browser) {
  console.log('\nChování');
  // Zavření drží v relaci, nová relace pruh ukáže.
  let { context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } });
  await page.click('.announcement_close');
  ok('křížek pruh skryje', !(await measure(page)).shown);
  ok('fokus po zavření na logu', await page.evaluate(() => document.activeElement.classList.contains('navbar_logo-link')));
  await page.goto(BASE + '/kontakty', { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  ok('v téže relaci se na další stránce neukáže', !(await measure(page)).shown);
  await context.close();
  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } }));
  ok('nová relace pruh zase ukáže', (await measure(page)).shown);

  // Rotace po 5 s, pauza při hoveru a fokusu.
  ok('na začátku je vidět první zpráva', (await measure(page)).active === 0);
  await sleep(5400);
  ok('po 5 s je vidět druhá zpráva', (await measure(page)).active === 1);
  await page.hover('.announcement_link');
  await sleep(6000);
  ok('při hoveru rotace stojí (6 s)', (await measure(page)).active === 1);
  await page.mouse.move(700, 600);
  await sleep(5400);
  const left = await measure(page);
  ok('po odjetí myši pokračuje', left.active === 2, 'aktivní zpráva ' + left.active);
  await page.focus('.announcement_link');
  await sleep(6000);
  ok('při fokusu rotace stojí (6 s)', (await measure(page)).active === 2);
  await context.close();

  // Reduced motion: střídání bez přechodu.
  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }));
  await sleep(5400);
  const rm = await measure(page);
  ok('reduced motion: střídá se bez přechodu a posunu', rm.active === 1 && rm.transitions.every(t => t === 'none'), rm.transitions.join(' | '));
  await context.close();

  // Konec akce: podvržené hodiny.
  const at = time => async page => page.clock.install({ time: new Date(time) });
  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } }, at('2026-12-31T23:58:00+01:00')));
  ok('31. 12. 2026 23:58: pruh je vidět', (await measure(page)).shown);
  await context.close();
  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 } }, at('2027-01-01T00:00:30+01:00')));
  let m = await measure(page);
  ok('1. 1. 2027 00:00: pruh se neukáže a odsazení je 0', !m.shown && m.bodyPad === 0 && Math.abs(m.navTop) < 1);
  await context.close();

  // Bez JS.
  ({ context, page } = await open(browser, '/', { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }));
  m = await measure(page);
  const noJs = await page.evaluate(() => [...document.querySelectorAll('.announcement_text')].map(el => getComputedStyle(el).display));
  ok('bez JS: vidět je jen první zpráva', noJs[0] === 'block' && noJs.slice(1).every(d => d === 'none'), noJs.join('/'));
  ok('bez JS: pruh je odkaz na Kontakty, křížek skrytý', m.href === '/kontakty' && !m.closeShown);
  ok('bez JS: navigace pod pruhem a obsah odsazený', m.navTop >= m.barH - 1 && m.bodyPad >= m.barH - 1, `pruh ${m.barH}, body ${m.bodyPad}`);
  await page.screenshot({ path: path.join(OUT, '1440-cs-bez-js.png'), clip: { x: 0, y: 0, width: 1440, height: 220 } });
  await context.close();
}

async function formLink(browser) {
  console.log('\nKlik vede na formulář a ten je vidět pod navigací');
  for (const lang of Object.keys(TEXTS)) {
    for (const w of [1440, 390]) {
      const t = TEXTS[lang];
      const { context, page } = await open(browser, t.prefix + '/', { viewport: { width: w, height: 900 } });
      await Promise.all([page.waitForURL(/kontakty#formular/, { waitUntil: 'domcontentloaded' }), page.click('.announcement_link')]);
      await page.addStyleTag({ content: HIDE_COOKIES });
      await sleep(1200);
      const r = await page.evaluate(() => {
        const f = document.getElementById('formular');
        const nav = document.querySelector('.navbar_component').getBoundingClientRect();
        const h = f.querySelector('h2, h3, form');
        return { url: location.pathname + location.hash, top: f.getBoundingClientRect().top, head: h ? h.getBoundingClientRect().top : null, navBottom: nav.bottom };
      });
      ok(`${w} ${lang}: ${r.url}, začátek formuláře pod navigací`, r.url === t.prefix + '/kontakty#formular' && r.head >= r.navBottom,
        `nadpis ${Math.round(r.head)}, navigace končí ${Math.round(r.navBottom)}`);
      if (w === 390 && lang === 'cs') await page.screenshot({ path: path.join(OUT, '390-cs-formular.png') });
      await context.close();
    }
  }
}

async function head() {
  console.log('\nHead a footer v publikovaném HTML');
  for (const lang of Object.keys(TEXTS)) {
    const html = await (await fetch(BASE + TEXTS[lang].prefix + '/')).text();
    const fin = ['attributes-scrolldisable', 'attributes-richtext', 'attributes-cmsfilter', 'attributes@2', 'cookie-consent'].filter(s => html.includes(s));
    const pin = (html.match(/eldr@([0-9a-f]{40})\/src\/dev\/announcement-bar\.js/) || [])[1];
    ok(`${lang}: GTM-W6PR2VX, 5 Finsweet, pruh se připnutým commitem`, html.includes('GTM-W6PR2VX') && fin.length === 5 && !!pin, `Finsweet ${fin.length}, commit ${pin || 'chybí'}`);
    ok(`${lang}: text pruhu je v surovém HTML`, html.includes('announcement_component'));
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    await head();
    await layout(browser);
    await offsets(browser);
    await behaviour(browser);
    await formLink(browser);
  } finally {
    await browser.close();
  }
  const failed = results.filter(r => !r.pass).length;
  fs.writeFileSync(path.join(OUT, 'vysledky.json'), JSON.stringify({ base: BASE, local: LOCAL, date: new Date().toISOString(), passed: results.length - failed, failed, results }, null, 2));
  console.log(`\n${results.length - failed}/${results.length} prošlo`);
  process.exit(failed ? 1 : 0);
})();
