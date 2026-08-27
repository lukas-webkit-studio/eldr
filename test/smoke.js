/* Smoke test: ověří, že bundle běží bez chyb a že klíčové moduly reagují
   na STARÉ i NOVÉ názvy tříd. Spuštění: node test/smoke.js */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const bundle = fs.readFileSync(require('path').join(__dirname, '..', 'dist', 'eldr.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅ ' + n)) : (fail++, console.log('  ❌ ' + n)); };

/* Webflow plní <html lang> podle jazykové mutace, ne podle celé cesty.
   Harness to musí dělat stejně, jinak by testoval stav, který na webu
   nenastane — a maskoval by chyby v detekci jazyka. */
function langFor(url) {
  const seg = new URL(url).pathname.split('/')[1];
  return ['en', 'de'].includes(seg) ? seg : 'cs';
}

function run(name, html, url, check) {
  console.log('\n' + name);
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="${langFor(url)}"><head><meta name="theme-color" content="#fcfcfc"></head><body>${html}</body></html>`,
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
   <div class="longtext_component">text</div><div class="longtext_button">Více</div>
   <section id="hero"><a class="button">Poptat</a></section>
   <span class="counter_years">36</span>`,
  'https://www.eldr.cz/en/reference',
  (win, doc) => {
    ok('body má lang-en', doc.body.classList.contains('lang-en'));

    // Client-first tlačítka musí měřit stejně jako stará .button--primary,
    // jinak by se s postupem migrace měření tiše vytrácelo.
    win.dataLayer = [];
    doc.querySelector('.button').click();
    const cf = win.dataLayer.filter(e => e.event === 'button_click');
    ok('GTM měří i client-first .button', cf.length === 1 && cf[0].button_text === 'Poptat');
    ok('client-first tlačítko zná svou sekci', cf.length === 1 && cf[0].section === 'hero');
    ok('německá reference přeložena anglicky', doc.querySelector('.reference_item-language').textContent === 'Translated from German');
    ok('tlačítko dlouhého textu obslouženo', doc.querySelector('.longtext_button').style.display !== '');

    const c = doc.querySelector('.counter_years');
    ok('počítadlo NEukazuje finální číslo před animací', c.textContent !== '36');
    ok('počítadlo ukazuje startovní hodnotu', c.textContent === '20');
    ok('počítadlo je odkryté (má is-counter-ready)', c.classList.contains('is-counter-ready'));
  });

// --- 3. regrese: cesta obsahující "/de" nesmí přepnout jazyk -------------
// Dřív se jazyk hádal přes url.indexOf('/de'), takže tahle česká stránka
// dostala němčinu — a její anglická mutace taky. Ze 87 URL na to dojely dvě.
run('Česká stránka s "/de" v cestě (regrese detekce jazyka)',
  '<div class="reference_item-language">de</div>',
  'https://www.eldr.cz/produkty/designova-a-interierova-svitidla-specialni-projekty',
  (win, doc) => {
    ok('body má lang-cs, ne lang-de', doc.body.classList.contains('lang-cs'));
    ok('německá reference přeložena česky',
      doc.querySelector('.reference_item-language').textContent === 'Přeloženo z němčiny');
  });

run('Anglická mutace téže stránky (regrese detekce jazyka)',
  '<div class="reference_item-language">de</div>',
  'https://www.eldr.cz/en/produkty/designova-a-interierova-svitidla-specialni-projekty',
  (win, doc) => {
    ok('body má lang-en, ne lang-de', doc.body.classList.contains('lang-en'));
    ok('německá reference přeložena anglicky',
      doc.querySelector('.reference_item-language').textContent === 'Translated from German');
  });

// --- 4. bannery z CMS -----------------------------------------------------
// Šablona vykreslí CELOU kolekci Bannery do skrytého zdroje (knihovna),
// v kolekci Inspirace se nemění nic. Fixture kopíruje skutečný výstup Webflow
// Collection Listu včetně `w-dyn-bind-empty` na nevyplněném druhém obrázku
// a `w-condition-invisible` na struktuře, kterou vypnula podmíněná viditelnost.
const BANNER_SOURCE = `
  <div data-banner-source class="banner-source" style="display:none"><div class="w-dyn-list"><div role="list" class="w-dyn-items">
    <div role="listitem" class="w-dyn-item">
      <div id="pylony-velky" class="banner-item">
        <div class="banner-name">Pylony – velký</div>
        <section data-banner-variant="velky" class="banner-cta-big"><div class="contain"><div class="banner-cta-big-columns">
          <div class="banner-cta-big_content">
            <h2 class="heading-style-h4">Pylony, které upoutají</h2>
            <p>Přizpůsobíme pylon vašim potřebám.</p>
            <a href="/kontakty" class="button is-alternate cta-section w-button">Cenová nabídka</a>
          </div><div class="banner-cta-big_image-wrapper">
            <img class="banner-cta-big-image left" src="a.webp" srcset="a.webp 500w" alt="Pylon">
            <img class="banner-cta-big-image right w-dyn-bind-empty">
          </div>
        </div></div></section>
        <section data-banner-variant="maly" class="banner-cta-small"><div class="contain"><div class="banner-cta-small_content">
          <h2 class="heading-style-h4 cta-section">Pylony, které upoutají</h2>
          <a href="/kontakty" class="button is-alternate cta-section w-button">Cenová nabídka</a>
        </div></div></section>
      </div>
    </div>
    <div role="listitem" class="w-dyn-item">
      <div id="rezana-grafika-maly" class="banner-item">
        <div class="banner-name">Řezaná grafika – malý</div>
        <section data-banner-variant="velky" class="banner-cta-big w-condition-invisible"><h2>Vypnutá varianta</h2></section>
        <section data-banner-variant="maly" class="banner-cta-small"><div class="contain"><div class="banner-cta-small_content">
          <h2 class="heading-style-h4 cta-section">Malý banner</h2>
          <a href="/kontakty" class="button is-alternate cta-section w-button">Cenová nabídka</a>
        </div></div></section>
      </div>
    </div>
  </div></div></div>`;

run('Bannery z CMS (zástupný text v rich textu)',
  `${BANNER_SOURCE}
   <div class="w-richtext"><p>Úvodní odstavec.</p><p>[banner:Pylony-Velky]</p></div>
   <div class="w-richtext">
     <p>Věta s <strong>tučným</strong> a <a href="/x">odkazem</a>. [banner: Řezaná grafika – malý ]</p>
     <p>[banner:neexistuje]</p><p>[banner]</p><p>Závěr.</p>
   </div>`,
  'https://www.eldr.cz/inspirace/jak-vybrat-reklamni-pylon',
  (win, doc) => {
    const rich = doc.querySelectorAll('.w-richtext');
    ok('pojmenovaný banner sedí v prvním rich textu', rich[0].querySelectorAll('.banner-cta-big').length === 1);
    ok('banner je vložen na místo tokenu, ne na konec',
      rich[0].firstElementChild.tagName === 'P' && rich[0].children[1].classList.contains('banner-cta-big'));
    ok('prázdný odstavec po tokenu zmizel', rich[0].children.length === 2);

    // Přepínač Velký banner je vypnutý → Webflow označí velkou variantu
    // w-condition-invisible a do článku musí jít malá.
    ok('vypnutá varianta se nevykreslí', !rich[1].querySelector('.banner-cta-big'));
    ok('vybrala se malá varianta', rich[1].querySelectorAll('.banner-cta-small').length === 1);

    // Klient nemusí opisovat slug znak po znaku — název s diakritikou,
    // mezerami i pomlčkou musí vést na stejný záznam.
    ok('název s diakritikou najde banner', /Malý banner/.test(rich[1].textContent));

    // Token uprostřed věty: banner se vloží ZA odstavec, text zůstane.
    const veta = rich[1].querySelector('p');
    ok('token uprostřed věty nechal text i formátování', /Věta s tučným a odkazem\./.test(veta.textContent.trim()));
    ok('odkaz uvnitř odstavce přežil úklid tokenu', !!veta.querySelector('a[href="/x"]'));
    ok('banner z tokenu uprostřed věty stojí za odstavcem',
      veta.nextElementSibling.classList.contains('banner-cta-small'));

    ok('žádný [banner…] nezůstal na stránce viditelný', !/\[banner/i.test(doc.body.textContent));
    ok('nenalezený banner i holé [banner] odstavec smazaly', rich[1].querySelectorAll('p').length === 2);

    // Do článku nesmí prosáknout pomocné prvky knihovny.
    ok('skrytý nosič názvu se do článku nedostal', !doc.querySelector('.w-richtext .banner-name'));
    ok('klon nenese data-banner-variant', !doc.querySelector('.w-richtext [data-banner-variant]'));
    ok('klon nenese w-dyn-item ani role="listitem"', !doc.querySelector('.w-richtext [role="listitem"]'));

    // Prázdné pole nesmí skončit v článku jako <img> bez src.
    const big = rich[0].querySelector('.banner-cta-big');
    ok('prázdné CMS pole (druhý obrázek) se nevykreslí', big.querySelectorAll('img').length === 1);
    ok('obrázek si nese srcset i alt', big.querySelector('img').getAttribute('srcset') === 'a.webp 500w' &&
      big.querySelector('img').getAttribute('alt') === 'Pylon');

    // Zdroj zůstává skrytý a nedotčený — vykresluje se z klonů.
    const src = doc.querySelector('[data-banner-source]');
    ok('zdroj zůstal skrytý', src.style.display === 'none');
    ok('zdroj si nechal obě položky', src.querySelectorAll('.banner-item').length === 2);

    // Bannery se vkládají v modulu 05, měření sedá v modulu 90 — tlačítko
    // banneru se tím poprvé vůbec dostane do GTM.
    win.dataLayer = [];
    big.querySelector('.button').click();
    const ev = win.dataLayer.filter(e => e.event === 'button_click');
    ok('GTM měří tlačítko vloženého banneru', ev.length === 1 && ev[0].button_text === 'Cenová nabídka');
  });

run('Článek bez zdroje bannerů (modul se musí vypnout)',
  '<div class="w-richtext"><p>[banner:pylony-velky]</p></div>',
  'https://www.eldr.cz/inspirace/rezana-grafika-zaujmete-zakaznika-na-prvni-pohled',
  (win, doc) => {
    // Bez `[data-banner-source]` modul nesmí sáhnout na text. Chybějící
    // zdroj je chyba šablony, ne důvod mazat obsah článku.
    ok('text článku zůstal nedotčený', doc.querySelector('.w-richtext p').textContent === '[banner:pylony-velky]');
  });

// --- 5. sdílení do AI ------------------------------------------------------
// Hák je ve Webflow zapsaný jako DOM id, ne jako custom atribut. Modul se
// na tom tiše vypínal a tlačítka zůstávala na href="#" — klik nedělal nic.
const AI_LINKS = `
  <a data-ai="chatgpt" href="#" class="button is-small is-custom">ChatGPT</a>
  <a data-ai="googleai" href="#" class="button is-small is-custom">Google AI</a>
  <a data-ai="perplexity" href="#" class="button is-small is-custom">Perplexity</a>
  <a data-ai="claude" href="#" class="button is-small is-custom">Claude</a>
  <a data-ai="copilot" href="#" class="button is-small is-custom">Microsoft Copilot</a>
  <a data-ai="copy" href="#" class="button is-small is-custom">Zkopírovat prompt</a>`;

const aiCheck = (win, doc) => {
  const href = t => doc.querySelector(`[data-ai="${t}"]`).getAttribute('href');
  ok('ChatGPT odkaz vyplněn', href('chatgpt').startsWith('https://chatgpt.com/?q='));
  ok('Google AI odkaz vyplněn', href('googleai').includes('google.com/search'));
  ok('Perplexity odkaz vyplněn', href('perplexity').startsWith('https://www.perplexity.ai/?q='));
  ok('Claude odkaz vyplněn', href('claude').startsWith('https://claude.ai/new?q='));
  ok('Copilot odkaz vyplněn', href('copilot').startsWith('https://copilot.microsoft.com/?q='));
  // „Zkopírovat prompt" nikam nevede — musí zůstat na # a klik nesmí skočit
  // na začátek stránky, jinak čtenář přijde o pozici v článku.
  ok('kopírovací tlačítko zůstalo na #', href('copy') === '#');
  const ev = new win.Event('click', { bubbles: true, cancelable: true });
  doc.querySelector('[data-ai="copy"]').dispatchEvent(ev);
  ok('klik na kopírování nenaviguje (preventDefault)', ev.defaultPrevented);
  ok('žádný odkaz na službu nezůstal na #',
    !doc.querySelector('[data-ai][href="#"]:not([data-ai="copy"])'));
  ok('odkazy se otevírají do nového okna', doc.querySelector('[data-ai]').getAttribute('target') === '_blank');
};

run('Sdílení do AI — hák jako DOM id (skutečný stav Webflow)',
  `<div id="data-ai-share">${AI_LINKS}</div>`,
  'https://www.eldr.cz/inspirace/jak-vybrat-reklamni-pylon', aiCheck);

run('Sdílení do AI — hák jako custom atribut',
  `<div data-ai-share>${AI_LINKS}</div>`,
  'https://www.eldr.cz/inspirace/jak-vybrat-reklamni-pylon', aiCheck);

run('Sdílení do AI — prompt v jazyce stránky',
  `<div id="data-ai-share">${AI_LINKS}</div>`,
  'https://www.eldr.cz/en/inspirace/jak-vybrat-reklamni-pylon',
  (win, doc) => {
    const q = decodeURIComponent(doc.querySelector('[data-ai="claude"]').getAttribute('href'));
    ok('anglická mutace dostane anglický prompt', q.includes('Visit this URL'));
  });

// --- 6. prázdná stránka ---------------------------------------------------
run('Prázdná stránka (moduly se musí samy vypnout)', '<div></div>', 'https://www.eldr.cz/404', () => {});

console.log(`\n${pass} prošlo, ${fail} selhalo`);
process.exit(fail ? 1 : 0);
