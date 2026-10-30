/* Podklady pro Google Docs (issue #35): jeden HTML dokument na stránku a jazyk.
   Píše se pro klienta (vykání). Popisky jsou česky, údaje v jazyce stránky.
   U každého údaje je odkaz na místo na webu (textový fragment #:~:text=,
   Chrome/Edge/Safari na něj odscrollují a zvýrazní ho).

   node scripts/ai-vrstva/docs.js → data/ai-vrstva/docs/<slug>.<lang>.html */
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES } = require('./stranky');
const { load } = require('./jsonld');
const { facts } = require('./test-dohledatelnost');

const OUT = path.join(__dirname, '..', '..', 'data', 'ai-vrstva', 'docs');
const JAZYK = { cs: 'CS', en: 'EN', de: 'DE' };
const JAZYK_NAZEV = { cs: 'české', en: 'anglické', de: 'německé' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = s => encodeURIComponent(s).replace(/-/g, '%2D').replace(/,/g, '%2C');

/* Odkaz na citaci: začátek a konec citace jako textový fragment. */
function link(url, anchor, quote) {
  const words = quote.replace(/\s+/g, ' ').trim().split(' ');
  const frag = words.length <= 8
    ? enc(words.join(' '))
    : `${enc(words.slice(0, 4).join(' '))},${enc(words.slice(-4).join(' '))}`;
  return `${url}#${anchor ? anchor : ''}:~:text=${frag}`;
}

function fact(url, anchor, f, label) {
  if (!f) return '';
  const head = label ? `<b>${esc(label)}:</b> ` : '';
  return `<li>${head}${esc(f.value)} <a href="${esc(link(url, anchor, f.quote))}">[zdroj]</a></li>`;
}

/* Název dokumentu je vždy český název stránky, ať se dokumenty ve třech
   jazykových složkách jmenují stejně. */
const titleOf = (slug, lang) => `${load(slug, 'cs').page.name.value} – popis pro AI (${JAZYK[lang]})`;

function html(slug, lang) {
  const d = load(slug, lang);
  const ld = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'ai-vrstva', 'jsonld', `${slug}.${lang}.jsonld`), 'utf8');
  const n = facts(d).length;
  const P = [];
  P.push(`<h1>${esc(titleOf(slug, lang))}</h1>`);
  P.push(`<p><b>Stránka:</b> <a href="${d.url}">${d.url}</a></p>`);
  P.push(`<p>Tento dokument ukazuje, co se o stránce dozví vyhledávače a AI asistenti ze strojově čitelného popisu (JSON-LD). Návštěvník webu ho nevidí. <b>Každý údaj je doslovně převzatý z ${JAZYK_NAZEV[lang]} verze stránky</b>, nic se nedoplňovalo ani nepřekládalo. Odkaz [zdroj] otevře stránku přímo na místě, odkud údaj pochází.</p>`);
  P.push(`<p><b>V číslech:</b> ${d.products.length} výrobků a služeb, ${n} údajů, ${(d.faq || []).length} otázek s odpovědí. Všech ${n} údajů má zdroj na stránce (100 %).</p>`);

  P.push('<h2>Co stránka nabízí</h2><ul>');
  P.push(fact(d.url, null, d.page.name, 'Název'));
  P.push(fact(d.url, null, d.page.description, 'Popis'));
  (d.page.highlights || []).forEach(f => P.push(fact(d.url, null, f, 'Bod v úvodu')));
  (d.page.properties || []).forEach(p => P.push(fact(d.url, null, { value: `${p.name.value}: ${p.value.value}`, quote: p.value.quote }, null)));
  P.push('</ul>');

  P.push('<h2>Výrobky a služby</h2>');
  for (const pr of d.products) {
    const a = pr.anchor;
    P.push(`<h3>${esc(pr.name.value)}</h3>`);
    P.push(`<p>${esc(pr.description ? pr.description.value : '')} ${pr.description ? `<a href="${esc(link(d.url, a, pr.description.quote))}">[zdroj]</a>` : ''}</p>`);
    if (a) P.push(`<p><b>Sekce na stránce:</b> <a href="${d.url}#${a}">${d.url}#${a}</a></p>`);
    const groups = [
      ['Parametry', (pr.properties || []).map(p => ({ value: `${p.name.value}: ${p.value.value}`, quote: p.value.quote }))],
      ['Materiály', pr.materials || []],
      ['Provedení', pr.variants || []],
      ['Použití', pr.uses || []]
    ];
    for (const [title, list] of groups) {
      if (!list.length) continue;
      P.push(`<p><b>${title}</b></p><ul>${list.map(f => fact(d.url, a, f)).join('')}</ul>`);
    }
    if (pr.image) P.push(`<p><b>Obrázek:</b> <a href="${esc(pr.image.src)}">${esc(pr.image.alt || 'obrázek ze sekce')}</a></p>`);
  }

  P.push('<h2>Otázky a odpovědi</h2>');
  if ((d.faq || []).length) {
    for (const q of d.faq) {
      P.push(`<p><b>${esc(q.question.value)}</b> <a href="${esc(link(d.url, null, q.question.quote))}">[zdroj]</a></p><p>${esc(q.answer.value)} <a href="${esc(link(d.url, null, q.answer.quote))}">[zdroj]</a></p>`);
    }
  } else {
    P.push('<p>Stránka neobsahuje otázky s odpovědí, proto je vrstva neobsahuje. Žádné jsme nedoplňovali.</p>');
  }

  P.push('<h2>Co do popisu nešlo a proč</h2><ul>');
  (d.vynechano || []).forEach(x => P.push(`<li>${esc(x.text)} – ${esc(x.duvod)}</li>`));
  P.push('</ul>');

  P.push('<h2>Náhled vrstvy</h2>');
  P.push('<p>Přesně tento kód je v HTML stránky. Vidí ho vyhledávače a AI roboti, návštěvník ne.</p>');
  P.push(`<pre style="font-family:monospace;font-size:8pt">${esc(ld)}</pre>`);
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><title>${esc(titleOf(slug, lang))}</title></head><body>${P.join('\n')}</body></html>\n`;
}

if (require.main === module) {
  fs.mkdirSync(OUT, { recursive: true });
  const list = [];
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const h = html(slug, lang);
      fs.writeFileSync(path.join(OUT, `${slug}.${lang}.html`), h);
      list.push({ slug, lang, title: titleOf(slug, lang), bytes: Buffer.byteLength(h) });
    }
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(list, null, 1) + '\n');
  console.log(`${list.length} dokumentů → ${path.relative(process.cwd(), OUT)} (max ${Math.max(...list.map(l => l.bytes))} B)`);
}

module.exports = { html, link };
