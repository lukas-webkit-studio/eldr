/* Podklady pro Google Docs (issue #35): jeden HTML dokument na stránku a jazyk.
   Píše se pro klienta (vykání). Popisky jsou česky, údaje v jazyce stránky.
   U každého údaje je odkaz [zdroj] na místo na webu: textový fragment
   #:~:text=začátek,konec. Začátek se prodlužuje, dokud není na stránce
   jednoznačný, jinak by prohlížeč skočil na první výskyt jinde.

   Generování se zastaví, když test dohledatelnosti u stránky neprojde —
   dokument tedy nikdy netvrdí 100 %, které neplatí.

   node scripts/ai-vrstva/docs.js → data/ai-vrstva/docs/<slug>.<lang>.html */
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES } = require('./stranky');
const { load, vlastnosti } = require('./jsonld');
const { DIR, norm } = require('./udaje');
const { check } = require('./test-dohledatelnost');

const OUT = path.join(DIR, 'docs');
const JAZYK = { cs: 'CS', en: 'EN', de: 'DE' };
const VERZE = { cs: 'české', en: 'anglické', de: 'německé' };
const SKUPINY = [['parametr', 'Parametry'], ['material', 'Materiály'], ['provedeni', 'Provedení'], ['pouziti', 'Použití']];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = s => encodeURIComponent(s).replace(/-/g, '%2D').replace(/,/g, '%2C');

/* 1 výrobek, 2–4 výrobky, 5 výrobků */
const pocet = (n, [jeden, dva, pet]) => `${n} ${n === 1 ? jeden : n >= 2 && n <= 4 ? dva : pet}`;

/* Název dokumentu je vždy český název stránky, jazyk je v závorce. */
const titleOf = (slug, lang) => `${load(slug, 'cs').page.name.value} – popis pro AI (${JAZYK[lang]})`;

/* Odkaz na citaci. Začátek fragmentu = nejkratší počet úvodních slov, který
   je v textu stránky jen jednou (nejméně 4); konec = poslední 4 slova. */
function makeLink(url, pageText) {
  const hay = norm(pageText);
  const count = s => hay.split(s).length - 1;
  return (anchor, quote) => {
    // Fragment z doslovné citace (s typografickými znaky), počítání výskytů po normalizaci.
    const words = quote.replace(/\s+/g, ' ').trim().split(' ');
    let n = Math.min(4, words.length);
    while (n < words.length && count(norm(words.slice(0, n).join(' '))) > 1) n++;
    const start = words.slice(0, n).join(' ');
    const frag = n >= words.length - 4 ? enc(words.join(' ')) : `${enc(start)},${enc(words.slice(-4).join(' '))}`;
    return `${url}#${anchor || ''}:~:text=${frag}`;
  };
}

function html(slug, lang) {
  const d = load(slug, lang);
  const zdroj = path.join(DIR, '_zdroj');
  const text = fs.readFileSync(path.join(zdroj, `${slug}.${lang}.txt`), 'utf8').split('\n').join(' ');
  const outline = JSON.parse(fs.readFileSync(path.join(zdroj, `${slug}.${lang}.outline.json`), 'utf8'));
  const test = check(d, text, outline);
  if (test.errors.length) throw new Error(`${slug}.${lang}: test dohledatelnosti neprošel, dokument se negeneruje`);

  const ld = fs.readFileSync(path.join(DIR, 'jsonld', `${slug}.${lang}.jsonld`), 'utf8');
  const link = makeLink(d.url, text);
  let zdroje = 0;
  const src = (anchor, quote) => { zdroje++; return ` <a href="${esc(link(anchor, quote))}">[zdroj]</a>`; };
  const li = (anchor, label, value, quote) => `<li>${label ? `<b>${esc(label)}:</b> ` : ''}${esc(value)}${src(anchor, quote)}</li>`;

  const body = [];
  body.push('<h2>Co stránka nabízí</h2><ul>');
  body.push(li(null, 'Název', d.page.name.value, d.page.name.quote));
  if (d.page.description) body.push(li(null, 'Popis', d.page.description.value, d.page.description.quote));
  (d.page.properties || []).forEach(p => body.push(li(null, p.name.value, p.value.value, p.value.quote)));
  body.push('</ul>');

  body.push('<h2>Výrobky a služby</h2>');
  for (const pr of d.products) {
    const a = pr.anchor;
    body.push(`<h3>${esc(pr.name.value)}</h3>`);
    body.push(`<p><b>Název na stránce:</b> ${esc(pr.name.value)}${src(a, pr.name.quote)}</p>`);
    if (pr.description) body.push(`<p>${esc(pr.description.value)}${src(a, pr.description.quote)}</p>`);
    if (a) body.push(`<p><b>Sekce na stránce:</b> <a href="${d.url}#${a}">${d.url}#${a}</a></p>`);
    const vl = vlastnosti(pr, lang);
    for (const [skupina, nadpis] of SKUPINY) {
      const list = vl.filter(p => p.skupina === skupina);
      if (!list.length) continue;
      body.push(`<p><b>${nadpis}</b></p><ul>${list.map(p => li(a, skupina === 'parametr' ? p.name : null, p.value, p.quote)).join('')}</ul>`);
    }
    if (pr.image) body.push(`<p><b>Obrázek:</b> <a href="${esc(pr.image.src)}">${esc(pr.image.alt || 'fotografie ze sekce')}</a></p>`);
  }

  body.push('<h2>Otázky a odpovědi</h2>');
  if ((d.faq || []).length) {
    for (const q of d.faq) {
      body.push(`<p><b>${esc(q.question.value)}</b>${src(null, q.question.quote)}</p><p>${esc(q.answer.value)}${src(null, q.answer.quote)}</p>`);
    }
  } else {
    body.push('<p>Stránka neobsahuje otázky s odpovědí. Popis pro AI je proto také nemá, žádné jsme nedoplňovali.</p>');
  }

  if ((d.vynechano || []).length) {
    body.push('<h2>Co do popisu nešlo a proč</h2><ul>');
    d.vynechano.forEach(x => body.push(`<li><b>${esc(x.text)}</b> – ${esc(x.duvod)}</li>`));
    body.push('</ul>');
  }

  body.push('<h2>Příloha: přesný kód</h2>');
  body.push('<p>Takto je popis pro AI zapsaný v hlavičce stránky. Obsahuje stejné údaje jako dokument výš, jen ve formátu pro stroje. Kontrolovat ho nemusíte, slouží jako doklad.</p>');
  body.push(`<pre>${esc(ld)}</pre>`);

  const head = [];
  head.push(`<h1>${esc(titleOf(slug, lang))}</h1>`);
  head.push(`<p><b>Stránka:</b> <a href="${d.url}">${d.url}</a></p>`);
  head.push('<p><b>Popis pro AI</b> je kód v hlavičce stránky, ze kterého vyhledávače a AI asistenti (ChatGPT, Perplexity, Claude) poznají, co na stránce nabízíte. Návštěvník webu tento popis nevidí.</p>');
  head.push(`<p>Všechny údaje jsou doslovně převzaté z ${VERZE[lang]} verze stránky, nic jsme nedoplňovali ani nepřekládali. Odkaz [zdroj] otevře stránku přímo na místě, odkud údaj pochází.</p>`);
  head.push(`<p><b>V číslech:</b> ${pocet(d.products.length, ['výrobek nebo služba', 'výrobky a služby', 'výrobků a služeb'])}, ${pocet(zdroje, ['údaj', 'údaje', 'údajů'])} s odkazem na zdroj, ${pocet((d.faq || []).length, ['otázka', 'otázky', 'otázek'])} s odpovědí. Automatický test ověřil, že všechny citace na stránce jsou.</p>`);

  return {
    zdroje,
    html: `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(titleOf(slug, lang))}</title></head><body>\n${head.join('\n')}\n${body.join('\n')}\n</body></html>\n`
  };
}

if (require.main === module) {
  fs.mkdirSync(OUT, { recursive: true });
  const list = [];
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const { html: h, zdroje } = html(slug, lang);
      fs.writeFileSync(path.join(OUT, `${slug}.${lang}.html`), h);
      list.push({ slug, lang, title: titleOf(slug, lang), zdroje, bytes: Buffer.byteLength(h) });
    }
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(list, null, 1) + '\n');
  const sum = l => list.filter(x => x.lang === l).reduce((a, x) => a + x.zdroje, 0);
  console.log(`${list.length} dokumentů → ${path.relative(process.cwd(), OUT)}; údajů s odkazem: cs ${sum('cs')}, en ${sum('en')}, de ${sum('de')}`);
}

module.exports = { html };
