/* Test JSON-LD vrstvy pro AI (offline, běží v npm run check).
   - data/ai-vrstva/jsonld/*.jsonld odpovídá výstupu generátoru (nic ručně upraveného),
   - jeden @graph, unikátní @id, konvence URL a odkazů na firmu/web (shodné s S6 #34),
   - žádné ceny, hodnocení ani recenze,
   - každý text v grafu je buď údaj z dat vrstvy (se zdrojem), nebo popisek pole/navigace.
   Online validaci dělá scripts/ai-vrstva/validator.js (npm run validate:ai). */
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, BASE, urlFor } = require('./stranky');
const { build, load } = require('./jsonld');
const { facts, norm } = require('./test-dohledatelnost');

const DIR = path.join(__dirname, '..', '..', 'data', 'ai-vrstva', 'jsonld');
const ZAKAZANE = ['offers', 'price', 'priceCurrency', 'aggregateRating', 'review', 'reviewRating'];
const POPISKY = new Set(['Domů', 'Produkty', 'Provedení', 'Použití', 'Materiál', 'Home', 'Products', 'Variant', 'Use', 'Material', 'Startseite', 'Produkte', 'Ausführung', 'Einsatz']);
const STRUKTURA = new Set(['@context', '@type', '@id', 'url', 'item', 'image', 'inLanguage']);

let pass = 0, fail = 0;
const ok = (n, c, detail) => { if (c) pass++; else { fail++; console.log(`  ❌ ${n}${detail ? ': ' + detail : ''}`); } };

for (const { slug } of STRANKY) {
  for (const lang of Object.keys(LOCALES)) {
    const name = `${slug}.${lang}`;
    const data = load(slug, lang);
    const want = build(data);
    const file = path.join(DIR, `${name}.jsonld`);
    const got = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
    ok(`${name}: soubor odpovídá generátoru`, got && JSON.stringify(got) === JSON.stringify(want), got ? 'spusť node scripts/ai-vrstva/jsonld.js' : 'chybí');
    const g = want['@graph'];
    ok(`${name}: jeden @graph`, Array.isArray(g) && Object.keys(want).length === 2);

    const ids = [];
    const strings = [];
    (function walk(o, key) {
      if (Array.isArray(o)) return o.forEach(x => walk(x, key));
      if (o && typeof o === 'object') {
        for (const [k, v] of Object.entries(o)) {
          if (ZAKAZANE.includes(k)) ok(`${name}: zakázané pole ${k}`, false);
          if (k === '@id' && Object.keys(o).length > 2) ids.push(v); // definice uzlu, ne odkaz
          walk(v, k);
        }
      } else if (typeof o === 'string' && !STRUKTURA.has(key)) strings.push(o);
    })(want);
    ok(`${name}: unikátní @id`, new Set(ids).size === ids.length);
    const url = urlFor(slug, lang);
    ok(`${name}: @id stránky`, ids.includes(`${url}#webpage`) && ids.includes(`${url}#breadcrumb`));
    ok(`${name}: URL bez lomítka na konci`, ids.every(i => !/\/(#|$)/.test(i.replace(BASE + '/#', ''))));
    const json = JSON.stringify(want);
    ok(`${name}: odkaz na firmu a web`, json.includes(`"@type":"Organization","@id":"${BASE}/#organization"`) && json.includes(`"@type":"WebSite","@id":"${BASE}/#website"`));
    ok(`${name}: inLanguage`, g[0].inLanguage === lang);

    const known = new Set(facts(data).map(f => norm(f.value)));
    const nedohledane = strings.filter(s => s !== 'https://schema.org' && !POPISKY.has(s) && !known.has(norm(s)));
    ok(`${name}: všechny texty mají zdroj`, nedohledane.length === 0, nedohledane.slice(0, 3).join(' | '));
  }
}
console.log(`\nJSON-LD: ${pass} kontrol OK, ${fail} chyb`);
process.exit(fail ? 1 : 0);
