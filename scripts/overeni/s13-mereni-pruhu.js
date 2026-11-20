#!/usr/bin/env node
/* global sessionStorage -- běží v prohlížeči (page.evaluate) */
/* S13 #69: ověření měření kliků na horní pruh na stagingu.

   node scripts/overeni/s13-mereni-pruhu.js [--base https://eldr.webflow.io]
        [--local] [--commit <sha>] [--out docs/snimky/s13]

   --local   místo skriptu z jsDelivr podstrčí src/dev/announcement-bar.js
             z pracovního adresáře (kontrola před merge).
   --commit  zkontroluje, že stránka načítá dev kopii z tohoto commitu.
   Potřebuje Playwright s Chromiem (v cloudové session je globálně).

   Kontroluje v CS/EN/DE na 1440 a 390: href s ?pruh=zima-2026 před
   #formular, push announcement_click se správným locale před navigací,
   doskok na /kontakty?pruh=…#formular s nadpisem formuláře pod navigací,
   žádné contact_form_submit bez odeslání, klik s rozbitým dataLayer
   i s blokovaným GTM (googletagmanager.com je v každém kontextu
   zablokovaný), head s GTM-W6PR2VX a 5 Finsweet. Cookie lišta se skrývá. */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };
const BASE = opt('--base') || 'https://eldr.webflow.io';
const OUT = path.resolve(opt('--out') || 'docs/snimky/s13');
const COMMIT = opt('--commit');
const LOCAL = args.includes('--local');
const DEV_FILE = path.join(__dirname, '..', '..', 'src', 'dev', 'announcement-bar.js');
const HIDE_COOKIES = '.cookiesconsent{display:none!important}';
const LANGS = { cs: '', en: '/en', de: '/de' };
const SIZES = { desktop: { width: 1440, height: 900 }, mobil: { width: 390, height: 844 } };

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? '  ✅ ' : '  ❌ ') + name + (detail ? '  (' + detail + ')' : ''));
}

async function context(browser, viewport, broken) {
  const ctx = await browser.newContext({ viewport, ignoreHTTPSErrors: true });
  if (LOCAL) {
    await ctx.route(/cdn\.jsdelivr\.net\/gh\/lukas-webkit-studio\/eldr@[^/]+\/src\/dev\/announcement-bar\.js/, r =>
      r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(DEV_FILE, 'utf8') }));
  }
  // GTM vždy blokovaný: měření nesmí záviset na tom, jestli se container načte.
  await ctx.route(/leady\.com|challenges\.cloudflare\.com|googletagmanager\.com/, r => r.abort());
  await ctx.addInitScript(([css, broken]) => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
    });
    // Po pushi modulu (cíl kliku) zkopírovat dataLayer do sessionStorage,
    // ať je vidět i po navigaci. Posluchač na document běží až po odkazu.
    document.addEventListener('click', () => {
      try {
        const dl = Array.isArray(window.dataLayer) ? window.dataLayer : [];
        sessionStorage.setItem('s13-dl', JSON.stringify(dl.filter(x => x && typeof x.event === 'string' && !/^gtm\./.test(x.event))));
      } catch (e) { /* rozbitý dataLayer */ }
    });
    if (broken) {
      Object.defineProperty(window, 'dataLayer', { configurable: true, get() { return { push() { throw new Error('blokováno'); } }; }, set() {} });
    }
  }, [HIDE_COOKIES, broken]);
  return ctx;
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const [size, viewport] of Object.entries(SIZES)) {
    for (const [loc, prefix] of Object.entries(LANGS)) {
      console.log(`\n${loc.toUpperCase()} · ${size} ${viewport.width}`);
      const ctx = await context(browser, viewport, false);
      const page = await ctx.newPage();
      const errors = [];
      // turnstile: Cloudflare je zablokovaný záměrně, ať se neplní formulář.
      page.on('pageerror', e => { if (!/turnstile/.test(e.message)) errors.push(e.message); });
      await page.goto(BASE + (prefix || '/'), { waitUntil: 'load' });
      await page.waitForSelector('.announcement_component[data-announcement-ready]', { timeout: 15000 });
      if (COMMIT && loc === 'cs' && size === 'desktop') {
        const src = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /announcement-bar\.js/.test(s)) || '');
        ok('stránka načítá dev kopii z merge commitu', src.includes('eldr@' + COMMIT + '/'), src);
        const head = await page.evaluate(() => document.head.innerHTML);
        const fins = ['cmsfilter', 'richtext', 'scrolldisable', 'attributes@2', 'cookie-consent'].filter(f => head.includes(f));
        ok('head má GTM-W6PR2VX a 5 Finsweet', head.includes('GTM-W6PR2VX') && fins.length === 5, fins.join(', '));
      }
      const href = await page.getAttribute('.announcement_link', 'href');
      ok('odkaz má ?pruh=zima-2026 před #formular', href === `${prefix}/kontakty?pruh=zima-2026#formular`, href);
      if (size === 'mobil' || loc === 'cs') await page.screenshot({ path: path.join(OUT, `${viewport.width}-${loc}-pruh.png`) });

      await Promise.all([page.waitForURL(/\/kontakty\?pruh=zima-2026#formular$/, { timeout: 15000 }), page.click('.announcement_link')]);
      const dl = JSON.parse(await page.evaluate(() => sessionStorage.getItem('s13-dl')) || '[]');
      const ev = dl.filter(x => x.event === 'announcement_click');
      ok('klik pushnul announcement_click se správným locale', ev.length === 1 && ev[0].announcement === 'zima-2026' && ev[0].locale === loc && Object.keys(ev[0]).length === 3, JSON.stringify(ev));
      ok('URL po kliku', page.url() === `${BASE}${prefix}/kontakty?pruh=zima-2026#formular`, page.url());
      await page.waitForTimeout(800);
      const pos = await page.evaluate(() => {
        const nav = document.querySelector('.navbar_component').getBoundingClientRect();
        const h = document.querySelector('#formular h2').getBoundingClientRect();
        return { navBottom: Math.round(nav.bottom), h2Top: Math.round(h.top), h2Bottom: Math.round(h.bottom), vh: window.innerHeight };
      });
      ok('nadpis formuláře je vidět pod navigací', pos.h2Top >= pos.navBottom && pos.h2Bottom <= pos.vh, JSON.stringify(pos));
      const conv = await page.evaluate(() => (window.dataLayer || []).filter(x => x && x.event === 'contact_form_submit').length);
      ok('bez odeslání formuláře žádné contact_form_submit', conv === 0);
      ok('bez chyb v konzoli stránky', errors.length === 0, errors.join(' | '));
      if (size === 'mobil' || loc === 'cs') await page.screenshot({ path: path.join(OUT, `${viewport.width}-${loc}-formular.png`) });
      await ctx.close();
    }
  }

  console.log('\nRozbitý dataLayer (push vyhodí výjimku), GTM blokovaný');
  for (const [loc, prefix] of Object.entries(LANGS)) {
    const ctx = await context(browser, SIZES.desktop, true);
    const page = await ctx.newPage();
    const errors = [];
    // Jen chyby, které vznikly v kódu pruhu. Podvržený dataLayer shodí
    // i jiné skripty stránky (GTM snippet), to tady neměříme.
    page.on('pageerror', e => { if (/announcement-bar|eldr\.min\.js/.test(e.stack || '')) errors.push(e.message); });
    await page.goto(BASE + (prefix || '/'), { waitUntil: 'load' });
    await page.waitForSelector('.announcement_component[data-announcement-ready]', { timeout: 15000 });
    let navigated = true;
    await Promise.all([page.waitForURL(/\/kontakty\?pruh=zima-2026#formular$/, { timeout: 10000 }).catch(() => { navigated = false; }), page.click('.announcement_link')]);
    ok(`${loc}: klik i tak dovede na formulář`, navigated, page.url());
    ok(`${loc}: kód pruhu nevyhodil chybu`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  const fail = results.filter(r => !r.pass).length;
  fs.writeFileSync(path.join(OUT, 'vysledky.json'), JSON.stringify({ base: BASE, local: LOCAL, commit: COMMIT, date: new Date().toISOString(), results }, null, 2));
  console.log(`\n${results.length - fail}/${results.length} prošlo`);
  process.exit(fail ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
