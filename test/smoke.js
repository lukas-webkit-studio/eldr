/* Smoke test: ověří, že bundle běží bez chyb a že klíčové moduly reagují
   na STARÉ i NOVÉ názvy tříd. Spuštění: node test/smoke.js */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const bundle = fs.readFileSync(require('path').join(__dirname, '..', 'dist', 'eldr.js'), 'utf8');
let pass = 0, fail = 0;
const pending = [];   // kontroly, které čekají na MutationObserver
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

    // Hooky pro mezeru kolem banneru: odsazení sousedů se vypíná v CSS,
    // protože v rich textu ho drží padding odstavců a nadpisů.
    ok('vložený banner nese hook eldr-banner',
      rich[0].children[1].classList.contains('eldr-banner'));
    ok('předchůdce banneru nese hook eldr-banner-before',
      rich[0].firstElementChild.classList.contains('eldr-banner-before'));

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

// Mezera kolem banneru musí vyjít stejně, ať klient odentruje jakkoliv:
// prázdné odstavce kolem banneru jdou pryč a soused se označí hookem.
// Token v odrážce nesmí banner vrazit doprostřed seznamu — musel by pak
// sedět o úroveň níž a pravidlo pro mezeru by na něj nesedlo.
run('Bannery: mezera drží bez ohledu na odentrování',
  `${BANNER_SOURCE}
   <div class="w-richtext">
     <p>Odstavec.</p><p>&nbsp;</p><p><br></p><p>[banner:pylony-velky]</p><p><br></p><p>&nbsp;</p><p>Pokračování.</p>
   </div>
   <div class="w-richtext">
     <ul><li>[banner:rezana-grafika-maly]</li></ul><p>Za seznamem.</p>
   </div>
   <div class="w-richtext">
     <p>Před.</p><p>[banner:pylony-velky] [banner:rezana-grafika-maly]</p><p>Po.</p>
   </div>`,
  'https://www.eldr.cz/inspirace/jak-vybrat-reklamni-pylon',
  (win, doc) => {
    const rich = doc.querySelectorAll('.w-richtext');

    const kids = rich[0].children;
    ok('prázdné odstavce kolem banneru zmizely', kids.length === 3);
    ok('pořadí zůstalo odstavec → banner → odstavec',
      kids[0].textContent.trim() === 'Odstavec.' &&
      kids[1].classList.contains('banner-cta-big') &&
      kids[2].textContent.trim() === 'Pokračování.');
    ok('hook sedí na odstavci, který u banneru doopravdy zůstal',
      kids[0].classList.contains('eldr-banner-before') &&
      kids[1].classList.contains('eldr-banner'));

    // Token v odrážce: banner patří za celý seznam, ne mezi <li>.
    ok('banner z odrážky je přímý potomek rich textu',
      rich[1].firstElementChild.classList.contains('banner-cta-small'));
    ok('prázdný seznam po vyjmutí odrážky zmizel', !rich[1].querySelector('ul'));
    ok('text za seznamem zůstal', rich[1].children.length === 2 &&
      rich[1].children[1].textContent.trim() === 'Za seznamem.');

    // Dva bannery za sebou se nesmí navzájem přilepit — hook `before`
    // dostane jen odstavec před prvním z nich.
    const dva = rich[2].children;
    ok('dva tokeny v odstavci daly dva bannery za sebou', dva.length === 4 &&
      dva[1].classList.contains('eldr-banner') && dva[2].classList.contains('eldr-banner'));
    ok('banner před bannerem se nevynuluje', !dva[1].classList.contains('eldr-banner-before'));
    ok('hook dostal jen odstavec před prvním bannerem',
      dva[0].classList.contains('eldr-banner-before') &&
      !dva[3].classList.contains('eldr-banner-before'));
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

// --- 6. nahrávání příloh --------------------------------------------------
const UPLOAD = n => `<div class="form_upload${n > 1 ? ' is-hidden' : ''} w-file-upload">
  <input type="file" class="w-file-upload-input">
  <div class="w-file-upload-error-msg" data-w-size-error="Upload failed. Max size for files is 10 MB."
    data-w-type-error="Upload failed. Invalid file type."
    data-w-generic-error="Upload failed. Something went wrong. Please retry.">Upload failed. Max size for files is 10 MB.</div></div>`;
const UPLOAD_FORM = `<div id="form-kontakt" class="form__type1"><form><input id="jazyk">${[1, 2, 3].map(UPLOAD).join('')}</form></div>`;

run('Nahrávání příloh — odkrývání dalšího pole a německé hlášky',
  UPLOAD_FORM, 'https://www.eldr.cz/de/kontakty',
  (win, doc) => {
    const f = [...doc.querySelectorAll('.w-file-upload')];
    ok('na začátku je vidět jen první pole', f[1].style.display === 'none' && f[2].style.display === 'none');
    ok('chybová hláška přeložená do němčiny', f[0].querySelector('.w-file-upload-error-msg').textContent.startsWith('Hochladen fehlgeschlagen'));
    win.dataLayer = [];
    doc.querySelector('form').dispatchEvent(new win.Event('submit', { bubbles: true }));
    ok('formulář s přílohami NEodpaluje contact_form_submit z bundlu', !win.dataLayer.some(e => e.event === 'contact_form_submit'));
    f[0].querySelector('input').setAttribute('data-value', 'soubor.zip');
    // MutationObserver volá zpětně jako microtask, Promise.then přijde až po něm.
    pending.push(Promise.resolve().then(() => {
      ok('po nahrání prvního souboru se ukáže druhé pole, třetí ne',
        f[1].style.display === 'block' && f[2].style.display === 'none');
    }));
  });

run('Nahrávání příloh — čeština zůstává podle Designeru',
  UPLOAD_FORM, 'https://www.eldr.cz/kontakty',
  (win, doc) => {
    ok('česká stránka hlášku nepřepisuje', doc.querySelector('.w-file-upload-error-msg').textContent.startsWith('Upload failed. Max size'));
  });

// --- 6b. pás recenzí ------------------------------------------------------
const MARQUEE = `<div class="testimonial21_marquee"><div class="testimonial21_track"><div><a href="/reference#a" class="testimonial21_card">a</a></div><div aria-hidden="true"><a href="/reference#a" class="testimonial21_card">a</a></div></div></div>`;

// jsdom nemá PointerEvent, modul čte jen pole, která tu doplníme.
function pointer(win, type, x, y, buttons = 1, pointerType = 'mouse') {
  const e = new win.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons });
  Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: pointerType }, isPrimary: { value: true } });
  return e;
}

function marqueeChecks(win, doc) {
  const m = doc.querySelector('.testimonial21_marquee');
  const track = m.firstElementChild;
  const link = doc.querySelector('a');
  ok('obal má ořez jen při animaci', m.style.overflow === 'hidden');
  ok('obal je označený jako spuštěný', m.hasAttribute('data-marquee-ready'));
  ok('svislý scroll a zoom stránky zůstávají prohlížeči (touch-action)', m.style.touchAction === 'pan-y pinch-zoom');
  // jsdom nepočítá rozměry; bez šířky by se normalizace smyčky vůbec neprovedla.
  Object.defineProperty(track, 'scrollWidth', { value: 2000 });
  win.dispatchEvent(new win.Event('resize')); // modul si šířku měří při změně okna
  ok('kurzor grab na pásu i na kartě', m.style.cursor === 'grab' && link.style.cursor === 'grab');

  let clicks = 0;
  link.addEventListener('click', e => { clicks++; e.preventDefault(); });

  m.dispatchEvent(pointer(win, 'pointerdown', 100, 50));
  m.dispatchEvent(pointer(win, 'pointerup', 101, 50));
  link.click();
  ok('klik bez tahu projde', clicks === 1);

  // Myš stránku tahem neposouvá, takže tahem je i šikmý nebo svislý začátek.
  m.dispatchEvent(pointer(win, 'pointerdown', 100, 50));
  m.dispatchEvent(pointer(win, 'pointermove', 103, 60));
  ok('myš: i strmý začátek je tah pásu', m.hasAttribute('data-marquee-dragging'));
  m.dispatchEvent(pointer(win, 'pointerup', 103, 60));
  link.click();
  ok('myš: klik po takovém tahu se potlačí', clicks === 1);

  // Puštění tlačítka se ztratilo (kontextové menu): další pohyb bez tlačítka tah nespustí.
  m.dispatchEvent(pointer(win, 'pointerdown', 100, 50));
  m.dispatchEvent(pointer(win, 'pointermove', 160, 50, 0));
  ok('pohyb bez stisknutého tlačítka tah nespustí', !m.hasAttribute('data-marquee-dragging'));
  m.dispatchEvent(pointer(win, 'pointermove', 220, 50, 0));
  ok('ani další pohyb pás nepřilepí ke kurzoru', !m.hasAttribute('data-marquee-dragging'));

  m.dispatchEvent(pointer(win, 'pointerdown', 100, 50));
  m.dispatchEvent(pointer(win, 'pointermove', 110, 51));
  m.dispatchEvent(pointer(win, 'pointermove', 190, 52));
  ok('při tahu je kurzor grabbing a karty nereagují',
    m.style.cursor === 'grabbing' && track.style.pointerEvents === 'none' && m.hasAttribute('data-marquee-dragging'));

  // Dotyk je nejdřív zachycený na kartě; když si ukazatel převezme pás,
  // karta pošle lostpointercapture. Ten tah ukončit nesmí.
  link.dispatchEvent(pointer(win, 'lostpointercapture', 190, 52));
  ok('lostpointercapture z karty tah neukončí', m.hasAttribute('data-marquee-dragging'));

  // Vykreslení jde přes requestAnimationFrame, proto se čeká.
  pending.push(new Promise(resolve => setTimeout(resolve, 80)).then(() => {
    const x = parseFloat((track.style.transform.match(/translate3d\(([-\d.]+)px/) || [])[1]);
    ok('tah doprava o 80 px přetočí smyčku (polovina 1000 px, posun ' + x + ' px)', x > -935 && x < -905);
    m.dispatchEvent(pointer(win, 'pointerup', 190, 52));
    ok('po puštění je kurzor zpět grab a karty reagují', m.style.cursor === 'grab' && track.style.pointerEvents === '');
    link.click();
    ok('klik hned po tahu se potlačí', clicks === 1);
    link.click();
    ok('další klik už projde', clicks === 2);
  }));
}

run('Pás recenzí — modul převezme ořez, tah posouvá pás a potlačí klik',
  MARQUEE, 'https://www.eldr.cz/', marqueeChecks);

// Dotyk jde přes Touch Events: o směru rozhoduje modul, ne prohlížeč.
function touch(win, type, points) {
  const e = new win.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'touches', { value: points.map(([x, y], i) => ({ identifier: 7 + i, clientX: x, clientY: y })) });
  return e;
}

function touchChecks(win, doc) {
  const m = doc.querySelector('.testimonial21_marquee');
  const link = doc.querySelector('a');
  const dragging = () => m.hasAttribute('data-marquee-dragging');
  const send = (type, ...points) => { const e = touch(win, type, points); link.dispatchEvent(e); return e; };
  let clicks = 0;
  link.addEventListener('click', e => { clicks++; e.preventDefault(); });

  // 30° od vodorovné: tah pásu
  send('touchstart', [100, 100]);
  let e = send('touchmove', [126, 115]);
  ok('tah prstem pod 30° pás chytí a stránce scroll zakáže', dragging() && e.defaultPrevented);
  e = send('touchmove', [140, 195]);
  ok('po zámku tah drží i při 80 px svislého úletu', dragging() && e.defaultPrevented);
  m.dispatchEvent(pointer(win, 'pointercancel', 140, 195, 0, 'touch'));
  ok('pointercancel od prohlížeče tah prstem neukončí', dragging());
  send('touchend');
  ok('puštění prstu tah ukončí', !dragging());
  link.click();
  ok('klik po tahu prstem se potlačí', clicks === 0);

  // 40°: ještě tah
  send('touchstart', [100, 100]);
  send('touchmove', [123, 119]);
  ok('tah prstem pod 40° pás chytí', dragging());
  send('touchend');

  // 60°: scroll stránky, a to až do puštění
  send('touchstart', [100, 100]);
  e = send('touchmove', [110, 118]);
  ok('tah prstem pod 60° nechá scroll stránce', !dragging() && !e.defaultPrevented);
  e = send('touchmove', [190, 122]);
  ok('po zámku na svislý scroll už pás tah nechytí', !dragging() && !e.defaultPrevented);
  send('touchend');

  // prohlížeč už scrolluje (touchmove nejde zrušit): pás se nechytí
  send('touchstart', [100, 100]);
  const locked = touch(win, 'touchmove', [[140, 102]]);
  Object.defineProperty(locked, 'cancelable', { value: false });
  link.dispatchEvent(locked);
  ok('nezrušitelný touchmove pás nechytí (stránka už scrolluje)', !dragging());
  send('touchend');

  // švihnutí s jediným pohybem: rychlost se počítá od stisku
  send('touchstart', [300, 100]);
  send('touchmove', [240, 102]);
  send('touchend');
  ok('krátké švihnutí tah ukončí', !dragging());

  // dotyk a pero přes Pointer Events jdou stranou, když jsou Touch Events
  m.dispatchEvent(pointer(win, 'pointerdown', 100, 50, 1, 'touch'));
  m.dispatchEvent(pointer(win, 'pointermove', 160, 52, 1, 'touch'));
  ok('pointer události dotyku tah nespustí (jde přes Touch Events)', !dragging());
  m.dispatchEvent(pointer(win, 'pointerup', 160, 52, 0, 'touch'));

  // druhý prst: zoom, tah končí
  send('touchstart', [100, 100]);
  send('touchmove', [140, 104]);
  send('touchstart', [140, 104], [200, 300]);
  ok('druhý prst tah ukončí (zoom)', !dragging());
  send('touchend');

  // Tah prstem pás opravdu posune a po hození pás nezastaví.
  const track = m.firstElementChild;
  const pos = () => parseFloat((track.style.transform.match(/translate3d\(([-\d.]+)px/) || [])[1]);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  pending.push(wait(50).then(() => {
    const before = pos();
    send('touchstart', [300, 100]);
    send('touchmove', [290, 101]);
    send('touchmove', [200, 110]);
    return wait(50).then(() => {
      ok('tah prstem o 90 px doleva posune pás o 90 px', Math.abs(pos() - before + 90) < 3);
      send('touchmove', [150, 112]);
      send('touchend');
      const a = pos();
      return wait(100).then(() => {
        const b = pos();
        return wait(100).then(() => {
          const c = pos();
          ok('po hození doleva pás jede dál doleva a zpomaluje, bez zastavení', b < a - 5 && c < b - 5 && a - b > b - c);
        });
      });
    });
  }));
}

run('Pás recenzí — dotyk: zámek směru 45°', MARQUEE, 'https://www.eldr.cz/', touchChecks);
// Touchpad, kolečko a šipky (#59). Dvě karty v seznamu kvůli rozteči a fokusu.
const MARQUEE2 = `<div class="testimonial21_marquee"><div class="testimonial21_track"><div><a href="/reference#a" class="testimonial21_card">a</a><a href="/reference#b" class="testimonial21_card">b</a></div><div aria-hidden="true"><a href="/reference#a" class="testimonial21_card">a</a><a href="/reference#b" class="testimonial21_card">b</a></div></div></div>`;

function wheelChecks(win, doc) {
  const m = doc.querySelector('.testimonial21_marquee');
  const track = m.firstElementChild;
  const link = doc.querySelector('a');
  Object.defineProperty(track, 'scrollWidth', { value: 2000 });
  win.dispatchEvent(new win.Event('resize'));
  const second = doc.querySelectorAll('a')[1];
  // Karta 300 px a mezera 68 px: krok má být rozteč, ne šířka karty.
  link.getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 100, width: 300, height: 100 });
  second.getBoundingClientRect = () => ({ left: 368, top: 0, right: 668, bottom: 100, width: 300, height: 100 });

  const pos = () => parseFloat((track.style.transform.match(/translate3d\(([-\d.]+)px/) || [])[1]);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const wheel = init => {
    const e = new win.WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true }, init));
    link.dispatchEvent(e);
    return e;
  };
  const near = (value, target) => Math.abs(value - target) < 1.5;
  let x0 = 0;

  pending.push((async () => {
    const first = wheel({ deltaX: 120 });
    ok('vodorovný wheel je defaultPrevented', first.defaultPrevented);
    await wait(60);
    x0 = pos();
    ok('vodorovný wheel posune pás doleva o deltaX (' + x0 + ' px)', x0 < -115 && x0 > -135);
    const locked = wheel({ deltaY: 80 });
    ok('svislá složka uvnitř vodorovného gesta stránku nepustí', locked.defaultPrevented);
    wheel({ deltaX: -50 });
    await wait(60);
    ok('wheel doprava vrací pás zpět', near(pos(), x0 + 50));
    await wait(120);
    ok('po gestu pás stojí (pauza před rozjezdem)', near(pos(), x0 + 50));

    await wait(200); // konec gesta, zámek osy se uvolní
    const vertical = wheel({ deltaY: 100 });
    ok('svislý wheel není defaultPrevented', !vertical.defaultPrevented);
    const drift = wheel({ deltaX: 60, deltaY: 10 });
    ok('vodorovná složka uvnitř svislého gesta pásem nehne', !drift.defaultPrevented);
    await wait(60);
    ok('svislý wheel pás neposunul', near(pos(), x0 + 50));

    await wait(200);
    const shifted = wheel({ deltaY: 100, shiftKey: true });
    await wait(60);
    ok('Shift + kolečko posouvá pás', shifted.defaultPrevented && near(pos(), x0 - 50));

    await wait(200);
    const lines = wheel({ deltaX: 1, deltaMode: 1 });
    await wait(60);
    ok('wheel v řádcích se přepočítá na px', lines.defaultPrevented && near(pos(), x0 - 90));

    // Zašuměný začátek gesta na touchpadu: o ose rozhodne až součet delt.
    await wait(200);
    const noise = wheel({ deltaX: 1, deltaY: -1 });
    const start = wheel({ deltaX: 2, deltaY: 0 });
    const swipe = wheel({ deltaX: 27, deltaY: 1 });
    await wait(60);
    ok('zašuměná první událost osu nezamkne, gesto do strany posune pás o součet',
      !noise.defaultPrevented && start.defaultPrevented && swipe.defaultPrevented && near(pos(), x0 - 120));
    await wait(200);
    const down = [wheel({ deltaX: 1, deltaY: 1 }), wheel({ deltaX: 1, deltaY: 30 }), wheel({ deltaX: 40, deltaY: 5 })];
    await wait(60);
    ok('zašuměný začátek svislého gesta: stránka scrolluje, pás stojí',
      down.every(e => !e.defaultPrevented) && near(pos(), x0 - 120));
    wheel({ deltaX: 30, deltaMode: 0 }); // stále svislé gesto, vrací polohu do stavu pro další kontroly
    await wait(200);
    wheel({ deltaX: -30 });
    await wait(60);

    await wait(200);
    const zoom = wheel({ deltaX: 100, ctrlKey: true });
    ok('Ctrl + wheel (zoom) se nezachytává', !zoom.defaultPrevented);

    const tab = new win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    link.dispatchEvent(tab);
    ok('Tab se nezachytává', !tab.defaultPrevented);
    const back = new win.KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true });
    link.dispatchEvent(back);
    ok('Alt + šipka (zpět v prohlížeči) se nezachytává', !back.defaultPrevented);

    const key = (name, extra) => {
      const e = new win.KeyboardEvent('keydown', Object.assign({ key: name, bubbles: true, cancelable: true }, extra));
      doc.activeElement.dispatchEvent(e);
      return e;
    };
    link.focus();
    const right = key('ArrowRight');
    ok('šipka vpravo je defaultPrevented', right.defaultPrevented);
    ok('šipka vpravo přenese fokus na další kartu', doc.activeElement === second);
    await wait(50);
    const mid = pos();
    ok('šipka neposune pás skokem (po 50 ms ' + (mid - (x0 - 90)).toFixed(0) + ' px z 368)', mid < x0 - 91 && mid > x0 - 457);
    await wait(750);
    ok('šipka vpravo posune pás o rozteč karet doleva (368 px)', near(pos(), x0 - 458));
    key('ArrowLeft');
    ok('šipka vlevo vrátí fokus na první kartu', doc.activeElement === link);
    await wait(800);
    ok('šipka vlevo vrátí i pás', near(pos(), x0 - 90));

    // Držená klávesa posílá opakované stisky po desítkách ms.
    for (let i = 0; i < 10; i++) {
      key('ArrowRight', { repeat: i > 0 });
      await wait(20);
    }
    await wait(900);
    const held = (x0 - 90 - pos()) / 368;
    ok('držená šipka karty nestřádá (' + held.toFixed(1) + ' karty za 0,2 s držení)', held > 0.9 && held < 2.1);
  })());
}

run('Pás recenzí — touchpad, kolečko a šipky', MARQUEE2, 'https://www.eldr.cz/', wheelChecks);

// Dočasná kopie pro custom code homepage (src/dev/) musí dělat totéž.
(function () {
  const path = require('path');
  const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const mod = read('src/modules/45-testimonial-marquee.js');
  const dev = read('src/dev/testimonial-marquee.js');
  const body = (src, end) => src.slice(src.indexOf('  var SPEED'), src.indexOf(end));
  console.log('\nPás recenzí — dev kopie (src/dev/testimonial-marquee.js)');
  ok('tělo dev kopie je shodné s modulem',
    body(mod, '  onReady(function () {') === body(dev, '  function start() {') && body(dev, '  function start() {').length > 1000);

  const dom = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${MARQUEE}</body></html>`,
    { url: 'https://www.eldr.cz/', runScripts: 'outside-only', pretendToBeVisual: true });
  let error = null;
  try {
    dom.window.eval(dev);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  } catch (e) { error = e; }
  ok('dev kopie proběhla bez výjimky', !error);
  marqueeChecks(dom.window, dom.window.document);

  const domTouch = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${MARQUEE}</body></html>`,
    { url: 'https://www.eldr.cz/', runScripts: 'outside-only', pretendToBeVisual: true });
  domTouch.window.eval(dev);
  domTouch.window.document.dispatchEvent(new domTouch.window.Event('DOMContentLoaded'));
  touchChecks(domTouch.window, domTouch.window.document);

  const domWheel = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${MARQUEE2}</body></html>`,
    { url: 'https://www.eldr.cz/', runScripts: 'outside-only', pretendToBeVisual: true });
  domWheel.window.eval(dev);
  domWheel.window.document.dispatchEvent(new domWheel.window.Event('DOMContentLoaded'));
  wheelChecks(domWheel.window, domWheel.window.document);

  // Bundle i dev kopie na jedné stránce: pás řídí jen ten první.
  const both = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${MARQUEE}</body></html>`,
    { url: 'https://www.eldr.cz/', runScripts: 'outside-only', pretendToBeVisual: true });
  both.window.eval(dev);
  both.window.eval(bundle);
  both.window.document.dispatchEvent(new both.window.Event('DOMContentLoaded'));
  const m = both.window.document.querySelector('.testimonial21_marquee');
  let captures = 0;
  m.setPointerCapture = () => { captures++; };
  m.dispatchEvent(pointer(both.window, 'pointerdown', 100, 50));
  m.dispatchEvent(pointer(both.window, 'pointermove', 140, 50));
  m.dispatchEvent(pointer(both.window, 'pointerup', 140, 50));
  ok('bundle + dev kopie: pás řídí jen jeden (pojistka data-marquee-ready)', captures === 1);
})();

// --- 6b. horní pruh s akcí (#62) -------------------------------------------
(function () {
  const path = require('path');
  const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const BAR = (end, href) => `<div class="navbar_component"><div class="announcement_component" data-announcement="zima-2026" data-announcement-end="${end}">` +
    `<a href="${href}" class="announcement_link" data-gtm="announcement-zima-2026"><div class="announcement_messages">` +
    '<p class="announcement_text">A <strong>aa</strong> a</p><p class="announcement_text">B bb</p><p class="announcement_text">C</p></div>' +
    '<div class="announcement_cta">Zamluvit termín →</div></a>' +
    '<button type="button" class="announcement_close"><span class="announcement_close-label">Zavřít oznámení</span></button></div>' +
    '<div class="navbar_container"><a href="/" class="navbar_logo-link">logo</a></div></div>';
  const FUTURE = '2099-12-31T23:59:59+01:00';

  // DOM s podvrženými časovači: rotaci řídí setTimeout, test ho spouští ručně.
  function dom(html, opts) {
    opts = opts || {};
    const d = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${html}</body></html>`,
      { url: opts.url || 'https://www.eldr.cz/', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = d.window;
    const timers = new Map();
    let seq = 0;
    w.setTimeout = (fn, ms) => { timers.set(++seq, { fn, ms }); return seq; };
    w.clearTimeout = id => { timers.delete(id); };
    w.requestAnimationFrame = fn => fn();
    w.scrollToY = y => { Object.defineProperty(w, 'pageYOffset', { configurable: true, value: y }); w.dispatchEvent(new w.Event('scroll')); };
    if (opts.reduce) w.matchMedia = q => ({ matches: /reduce/.test(q), media: q });
    if (opts.closed) w.localStorage.setItem('eldr-announcement-closed:zima-2026', '1');
    if (opts.noStorage) Object.defineProperty(w, 'localStorage', { get() { throw new Error('SecurityError'); } });
    // jsdom nepočítá layout: výšku pruhu podvrhnout, ať je vidět, že odsazení bere změřenou hodnotu.
    Object.defineProperty(w.HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return this.classList.contains('announcement_component') ? 47 : 0; } });
    const errors = [];
    try {
      (opts.scripts || [bundle]).forEach(s => w.eval(s));
      w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    } catch (e) { errors.push(e.message); }
    const fire = () => { const [id, t] = [...timers][0] || []; if (!t) return false; timers.delete(id); t.fn(); return true; };
    return { w, doc: w.document, timers, fire, errors };
  }

  function barChecks(env) {
    const { w, doc, timers, fire } = env;
    const bar = doc.querySelector('.announcement_component');
    const msgs = [...doc.querySelectorAll('.announcement_text')];
    const visible = el => el.style.opacity === '1' && el.style.visibility === 'visible' && !el.hasAttribute('aria-hidden');
    ok('proběhlo bez výjimky', env.errors.length === 0);
    ok('pruh je označený jako spuštěný', bar.hasAttribute('data-announcement-ready'));
    ok('odkaz dostal ?pruh=zima-2026 a kotvu #formular', doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?pruh=zima-2026#formular');
    ok('křížek je vidět až s JS', doc.querySelector('.announcement_close').style.display === 'flex');
    ok('všechny zprávy jsou v gridu (display: block)', msgs.every(m => m.style.display === 'block'));
    ok('na začátku je vidět jen první zpráva', visible(msgs[0]) && !visible(msgs[1]) && msgs[1].getAttribute('aria-hidden') === 'true');
    ok('body dostal odsazení podle změřené výšky pruhu (47 px)', doc.body.style.paddingTop === '47px');
    ok('rotace naplánovaná po 5 s', timers.size === 1 && [...timers.values()][0].ms === 5000);
    fire();
    ok('po 5 s je vidět druhá zpráva', visible(msgs[1]) && !visible(msgs[0]));
    if (!env.reduceMotion) {
      ok('odcházející zpráva odjíždí nahoru (návrh agentury)', msgs[0].style.transform === 'translateY(-70%)' && /opacity 450ms ease, transform 500ms cubic-bezier/.test(msgs[0].style.transition));
    }
    ok('a hned je naplánovaná další', timers.size === 1);
    fire(); fire();
    ok('po poslední zprávě znovu první', visible(msgs[0]));

    const link = doc.querySelector('.announcement_link');
    link.dispatchEvent(pointer(w, 'pointerover', 10, 10, 0, 'touch'));
    ok('klepnutí prstem rotaci nezastaví (dotyk nemá pointerout)', timers.size === 1);
    link.dispatchEvent(pointer(w, 'pointerover', 10, 10, 0));
    ok('hover myší rotaci zastaví (pointerover z potomka)', timers.size === 0);
    const out = (target, related) => { const e = pointer(w, 'pointerout', 10, 10, 0); Object.defineProperty(e, 'relatedTarget', { value: related }); target.dispatchEvent(e); };
    out(link, doc.querySelector('.announcement_close'));
    ok('přejezd myší z odkazu na křížek rotaci nerozjede', timers.size === 0);
    out(doc.querySelector('.announcement_close'), doc.body);
    ok('po odjetí myši z pruhu se rotace rozjede', timers.size === 1);
    Object.defineProperty(doc, 'hidden', { configurable: true, value: true });
    doc.dispatchEvent(new w.Event('visibilitychange'));
    ok('ve skryté záložce rotace stojí', timers.size === 0);
    Object.defineProperty(doc, 'hidden', { configurable: true, value: false });
    doc.dispatchEvent(new w.Event('visibilitychange'));
    ok('po návratu do záložky se rozjede', timers.size === 1);
    doc.querySelector('.announcement_link').dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
    ok('fokus uvnitř pruhu rotaci zastaví', timers.size === 0);
    doc.querySelector('.announcement_link').dispatchEvent(new w.FocusEvent('focusout', { bubbles: true, relatedTarget: doc.querySelector('.announcement_close') }));
    ok('přechod fokusu na křížek rotaci nerozjede', timers.size === 0);
    doc.querySelector('.announcement_close').dispatchEvent(new w.FocusEvent('focusout', { bubbles: true, relatedTarget: doc.querySelector('.navbar_logo-link') }));
    ok('odchod fokusu z pruhu rotaci rozjede', timers.size === 1);

    const nav = doc.querySelector('.navbar_component');
    w.scrollToY(20);
    ok('pruh při scrollu zůstává nahoře (navbar se neposouvá)', nav.style.transform === '');
    w.scrollToY(500);
    ok('ani dál na stránce pruh neodjede', nav.style.transform === '');
    w.scrollToY(300);
    doc.querySelector('.announcement_close').click();
    ok('křížek pruh skryje', bar.style.display === 'none');
    ok('po zavření navbar u horní hrany bez posunu', nav.style.transform === '');
    w.scrollToY(400);
    ok('po zavření scroll navbarem nehýbe', nav.style.transform === '');
    ok('po zavření je odsazení 0', doc.body.style.paddingTop === '0px');
    ok('po zavření rotace stojí', timers.size === 0);
    ok('zavření se pamatuje v localStorage (i po zavření prohlížeče)', w.localStorage.getItem('eldr-announcement-closed:zima-2026') === '1');
    ok('fokus přešel na logo', doc.activeElement === doc.querySelector('.navbar_logo-link'));
  }

  console.log('\nHorní pruh — rotace, pauza, zavření');
  barChecks(dom(BAR(FUTURE, '/kontakty')));

  console.log('\nHorní pruh — stavy');
  let e = dom(BAR(FUTURE, '/kontakty'), { closed: true });
  ok('zavřený dřív (localStorage) se neukáže', e.doc.querySelector('.announcement_component').style.display === 'none' && e.doc.body.style.paddingTop === '0px');
  e = dom(BAR('2026-11-19T00:00:00+01:00', '/kontakty'));
  ok('po konci akce se neukáže', e.doc.querySelector('.announcement_component').style.display === 'none' && e.doc.body.style.paddingTop === '0px' && e.timers.size === 0);
  e = dom(BAR('neplatne-datum', '/kontakty'));
  ok('neplatné datum = bez konce, pruh běží', e.doc.querySelector('.announcement_component').style.display !== 'none');
  e = dom(BAR(FUTURE, '/en/kontakty'), { url: 'https://www.eldr.cz/en' });
  ok('parametr a kotva se doplní i k anglické adrese', e.doc.querySelector('.announcement_link').getAttribute('href') === '/en/kontakty?pruh=zima-2026#formular');
  e = dom(BAR(FUTURE, '/kontakty#formular'));
  ok('existující kotvu z Designeru nezdvojí, parametr dá před ni', e.doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?pruh=zima-2026#formular');
  e = dom(BAR(FUTURE, '/kontakty?pruh=jaro-2026&x=1#formular'));
  ok('existující parametr nezdvojí, dá mu aktuální kampaň', e.doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?pruh=zima-2026&x=1#formular');
  e = dom(BAR(FUTURE, '#'));
  ok('odkaz jen s kotvou (href="#") nechá být', e.doc.querySelector('.announcement_link').getAttribute('href') === '#');
  e = dom(BAR(FUTURE, '/kontakty?x=1'));
  ok('k jinému parametru přidá &pruh=', e.doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?x=1&pruh=zima-2026#formular');
  e = dom(BAR(FUTURE, '/kontakty'), { reduce: true });
  const m = [...e.doc.querySelectorAll('.announcement_text')];
  e.fire();
  ok('reduced motion: střídání bez přechodu a bez posunu',
    m[1].style.opacity === '1' && m.every(x => x.style.transition === 'none' && x.style.transform === 'none'));
  e = dom(BAR(FUTURE, '/kontakty'), { noStorage: true });
  e.doc.querySelector('.announcement_close').click();
  ok('zakázané úložiště: modul nespadne a křížek pruh skryje', e.errors.length === 0 && e.doc.querySelector('.announcement_component').style.display === 'none');
  e = dom(BAR(FUTURE, '/kontakty').replace(/<p class="announcement_text">(B bb|C)<\/p>/g, ''));
  ok('jedna zpráva: bez rotace, odkaz i křížek fungují', e.timers.size === 0 &&
    e.doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?pruh=zima-2026#formular' &&
    e.doc.querySelector('.announcement_close').style.display === 'flex' && e.doc.body.style.paddingTop === '47px');
  e = dom(BAR(new Date(Date.now() + 60000).toISOString(), '/kontakty'));
  const realNow = Date.now;
  e.w.Date.now = () => realNow() + 120000;
  e.fire();
  e.w.Date.now = realNow;
  ok('záložka otevřená přes konec akce: pruh zmizí při dalším střídání',
    e.doc.querySelector('.announcement_component').style.display === 'none' && e.doc.body.style.paddingTop === '0px' && e.timers.size === 0);
  e = dom(BAR(FUTURE, '/kontakty').replace('</div><div class="announcement_cta">',
    '</div><div class="announcement_messages is-short"><p class="announcement_text">a</p><p class="announcement_text">b</p><p class="announcement_text">c</p></div><div class="announcement_cta">'));
  const [longSet, shortSet] = [...e.doc.querySelectorAll('.announcement_messages')].map(b => [...b.querySelectorAll('.announcement_text')]);
  e.fire();
  ok('dvě sady zpráv (dlouhá + mobilní) rotují spolu',
    longSet[1].style.opacity === '1' && shortSet[1].style.opacity === '1' && longSet[0].style.opacity === '0' && shortSet[0].style.opacity === '0' && e.timers.size === 1);
  e.fire(); e.fire();
  ok('po třetí zprávě obě sady znovu na první', longSet[0].style.opacity === '1' && shortSet[0].style.opacity === '1');
  e = dom('<div class="navbar_component"></div>');
  ok('bez pruhu se modul vypne a odsazení nesahá', e.errors.length === 0 && e.doc.body.style.paddingTop === '');

  const mod = read('src/modules/46-announcement-bar.js');
  const dev = read('src/dev/announcement-bar.js');
  const body = (src, end) => src.slice(src.indexOf('  var INTERVAL'), src.indexOf(end));
  console.log('\nHorní pruh — dev kopie (src/dev/announcement-bar.js)');
  ok('tělo dev kopie je shodné s modulem',
    body(mod, '  onReady(function () {') === body(dev, '  function start() {') && body(dev, '  function start() {').length > 1000);
  barChecks(dom(BAR(FUTURE, '/kontakty'), { scripts: [dev] }));
  e = dom(BAR(FUTURE, '/kontakty'), { scripts: [dev, bundle] });
  ok('bundle + dev kopie: pruh řídí jen jeden (pojistka data-announcement-ready)',
    e.timers.size === 1 && e.doc.querySelector('.announcement_link').getAttribute('href') === '/kontakty?pruh=zima-2026#formular');
  // Navigaci zarazit (jsdom ji neumí), push musí proběhnout dřív.
  function clicks(env, n) {
    env.doc.addEventListener('click', ev => ev.preventDefault());
    for (let i = 0; i < (n || 1); i++) env.doc.querySelector('.announcement_link').dispatchEvent(new env.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  clicks(e);
  ok('bundle + dev kopie: klik pushne jen jednou', e.w.dataLayer.filter(x => x.event === 'announcement_click').length === 1);

  // Odloženo až za časově citlivé testy pásu recenzí (wheel, šipky): každý
  // další JSDOM blokuje event loop a jejich čekání by se natáhla.
  pending.push(Promise.all(pending.slice()).then(() => {
    console.log('\nHorní pruh — měření kliku (#69)');
    e = dom(BAR(FUTURE, '/kontakty'));
    ok('bez kliku se do dataLayer nic nepošle', !e.w.dataLayer);
    e.w.dataLayer = [{ event: 'gtm.js' }];
    [['cs', '/'], ['en', '/en'], ['de', '/de/produkty']].forEach(([loc, url]) => {
      e.w.history.pushState(null, '', url);
      e.doc.documentElement.setAttribute('lang', loc);
      clicks(e);
      const ev = e.w.dataLayer[e.w.dataLayer.length - 1];
      ok(`klik pushne announcement_click, locale ${loc}`, ev.event === 'announcement_click' && ev.announcement === 'zima-2026' && ev.locale === loc && Object.keys(ev).length === 3);
    });
    ok('existující dataLayer doplní, nepřepíše', e.w.dataLayer.length === 4 && e.w.dataLayer[0].event === 'gtm.js');
    e.doc.documentElement.removeAttribute('lang');
    clicks(e);
    ok('bez lang na <html> vezme jazyk z cesty', e.w.dataLayer[4].locale === 'de');
    e.doc.querySelector('.announcement_link').dispatchEvent(new e.w.MouseEvent('auxclick', { bubbles: true, button: 1 }));
    e.doc.querySelector('.announcement_link').dispatchEvent(new e.w.MouseEvent('auxclick', { bubbles: true, button: 2 }));
    ok('prostřední tlačítko měří, pravé ne', e.w.dataLayer.length === 6);

    e = dom(BAR(FUTURE, '/kontakty'));
    Object.defineProperty(e.w, 'dataLayer', { configurable: true, get() { return { push() { throw new Error('blokováno'); } }; }, set() {} });
    let defaultPrevented = null;
    e.doc.addEventListener('click', ev => { defaultPrevented = ev.defaultPrevented; ev.preventDefault(); });
    let thrown = null;
    e.w.addEventListener('error', ev => { thrown = ev.message; });
    e.doc.querySelector('.announcement_link').dispatchEvent(new e.w.MouseEvent('click', { bubbles: true, cancelable: true }));
    ok('rozbitý dataLayer: klik nespadne a navigaci neblokuje', thrown === null && defaultPrevented === false);
  }));
})();

// --- 7. prázdná stránka ---------------------------------------------------
run('Prázdná stránka (moduly se musí samy vypnout)', '<div></div>', 'https://www.eldr.cz/404', () => {});

Promise.all(pending).catch(e => ok('odložená kontrola doběhla bez výjimky: ' + e.message, false)).then(() => {
  console.log(`\n${pass} prošlo, ${fail} selhalo`);
  process.exit(fail ? 1 : 0);
});
