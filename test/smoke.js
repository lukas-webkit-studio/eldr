/* Smoke test: ověří, že bundle běží bez chyb a že klíčové moduly reagují
   na STARÉ i NOVÉ názvy tříd. Spuštění: node test/smoke.js */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const bundle = fs.readFileSync(require('path').join(__dirname, '..', 'dist', 'eldr.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅ ' + n)) : (fail++, console.log('  ❌ ' + n)); };

function run(name, html, url, check) {
  console.log('\n' + name);
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="cs"><head><meta name="theme-color" content="#fcfcfc"></head><body>${html}</body></html>`,
    { url, runScripts: 'outside-only', pretendToBeVisual: true }
  );
  const errors = [];
  dom.window.addEventListener('error', e => errors.push(e.message));
  try {
    dom.window.eval(bundle);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    dom.window.dispatchEvent(new dom.window.Event('load'));
  } catch (e) { errors.push(e.message); }
  ok('bundle proběhl bez výjimky', errors.length === 0);
  if (errors.length) console.log('     ' + errors.join('\n     '));
  check(dom.window, dom.window.document);
}

const FORM = tag => `<div class="${tag}"><form><input id="jazyk" value=""></form></div>`;

// --- 1. staré názvy tříd -------------------------------------------------
run('STARÉ třídy (dnešní stav webu)',
  `<span data-var="YOE"></span>
   <div class="sectionreference__collection__item__language">en</div>
   ${FORM('form__type1')}
   <a class="navbar__link">Kontakty</a>
   <section id="hero"><a class="button--primary">Poptat</a></section>
   <div class="sectiontopproducts__item"><h2>Pylony</h2></div>
   <div class="sectionproducts__item"><h5>Totemy</h5></div>
   <div class="longtext">text</div><div class="longtext__button">Více</div>`,
  'https://www.eldr.cz/',
  (win, doc) => {
    ok('roky praxe doplněny do [data-var]', /^\d{2}$/.test(doc.querySelector('[data-var]').textContent));
    ok('body má lang-cs', doc.body.classList.contains('lang-cs'));
    ok('anglická reference přeložena', doc.querySelector('.sectionreference__collection__item__language').textContent === 'Přeloženo z angličtiny');

    win.dataLayer = [];
    doc.querySelector('.navbar__link').click();
    doc.querySelector('.button--primary').click();
    doc.querySelector('.sectiontopproducts__item').click();
    doc.querySelector('.sectionproducts__item').click();
    doc.querySelector('form').dispatchEvent(new win.Event('submit', { bubbles: true }));

    const ev = win.dataLayer.map(e => e.event);
    ok('GTM menu_click', ev.includes('menu_click'));
    ok('GTM button_click', ev.filter(e => e === 'button_click').length === 3);
    // Konverzi měří samostatný skript na #form-kontakt (Kontakty, Produkty).
    // Bundle ji odpalovat NESMÍ, jinak by se počítala dvakrát.
    ok('bundle NEodpaluje contact_form_submit (ochrana proti dvojímu měření)', !ev.includes('contact_form_submit'));

    const top = win.dataLayer.find(e => e.section === 'Home page');
    ok('produktová dlaždice posílá TEXT, ne DOM prvek', top && top.button_text === 'Pylony');
    const btn = win.dataLayer.find(e => e.section === 'hero');
    ok('tlačítko zná svou sekci', !!btn && btn.button_text === 'Poptat');
    ok('#jazyk vyplněn', doc.querySelector('#jazyk').value === 'cs');
  });

// --- 2. nové client-first názvy ------------------------------------------
run('NOVÉ client-first třídy (po migraci)',
  `<span data-var="YOE"></span>
   <div class="reference_item-language">de</div>
   <div class="longtext_component">text</div><div class="longtext_button">Více</div>`,
  'https://www.eldr.cz/en/reference',
  (win, doc) => {
    ok('body má lang-en', doc.body.classList.contains('lang-en'));
    ok('německá reference přeložena anglicky', doc.querySelector('.reference_item-language').textContent === 'Translated from German');
    ok('tlačítko dlouhého textu obslouženo', doc.querySelector('.longtext_button').style.display !== '');
  });

// --- 3. prázdná stránka ---------------------------------------------------
run('Prázdná stránka (moduly se musí samy vypnout)', '<div></div>', 'https://www.eldr.cz/404', () => {});

console.log(`\n${pass} prošlo, ${fail} selhalo`);
process.exit(fail ? 1 : 0);
