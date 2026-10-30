/* Generátor JSON-LD z dat vrstvy pro AI (issue #35).

   Každá hodnota pochází z data/ai-vrstva/<slug>.<lang>.json, kde má doslovnou
   citaci ze stránky. Generátor nic nepřidává kromě identifikátorů (@id),
   URL a popisků polí (`PropertyValue.name` u provedení a použití).

   Konvence společné s S6 (#34): jeden @graph na stránku, firma jen odkazem
   https://www.eldr.cz/#organization, web https://www.eldr.cz/#website,
   stránka <URL>#webpage, drobečky <URL>#breadcrumb, položky <URL>#<klíč>,
   URL bez lomítka na konci, inLanguage cs/en/de.

   Model (varianta D, viz docs/decisions.md): WebPage → mainEntity Service
   (kategorie stránky) → hasOfferCatalog → Offer.itemOffered → Service
   (jednotlivé výrobky, bez ceny). Parametr --variant A vygeneruje výrobky
   jako Product — jen pro srovnávací test v Google Rich Results Testu.
*/
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, BASE } = require('./stranky');
const { DIR, norm } = require('./udaje');

const VARIANTA = 'D';

/* Odkazy nesou @type, jinak validátor na samotné stránce uzel nezná
   (plný popis firmy a webu je jen na homepage, lane S6). */
const ORG = { '@type': 'Organization', '@id': `${BASE}/#organization` };
const WEBSITE = { '@type': 'WebSite', '@id': `${BASE}/#website` };

/* Popisky navigace a polí. Nejsou to údaje o výrobku, jen názvy. Drobečky
   jsou sjednocené s ostatními stránkami webu (S6, #34): značka a titulek
   stránky /produkty v daném jazyce. */
const UI = {
  cs: { home: 'Elektro Drapač', produkty: 'Naše produkty', variant: 'Provedení', use: 'Použití', material: 'Materiál' },
  en: { home: 'Elektro Drapač', produkty: 'Our products', variant: 'Variant', use: 'Use', material: 'Material' },
  de: { home: 'Elektro Drapač', produkty: 'Unsere Produkte', variant: 'Ausführung', use: 'Einsatz', material: 'Material' }
};

const v = f => (f && f.value ? f.value.trim() : undefined);
const clean = o => JSON.parse(JSON.stringify(o)); // zahodí klíče s hodnotou undefined

/* Parametry výrobku jako dvojice název/hodnota/citace, v pořadí: parametry
   ze stránky, materiály, provedení, použití. Hodnota, která už je obsažená
   v dřívější hodnotě (např. materiál uvnitř parametru „Materiál: …“), se
   vynechá, ať se tatáž věta neopakuje. */
function vlastnosti(pr, lang, { materialy = true } = {}) {
  const ui = UI[lang];
  const all = [
    ...(pr.properties || []).map(p => ({ name: v(p.name), value: v(p.value), quote: p.value.quote, skupina: 'parametr' })),
    ...(materialy ? (pr.materials || []).map(f => ({ name: ui.material, value: v(f), quote: f.quote, skupina: 'material' })) : []),
    ...(pr.variants || []).map(f => ({ name: ui.variant, value: v(f), quote: f.quote, skupina: 'provedeni' })),
    ...(pr.uses || []).map(f => ({ name: ui.use, value: v(f), quote: f.quote, skupina: 'pouziti' }))
  ];
  const out = [];
  for (const p of all) {
    const n = norm(p.value);
    if (out.some(o => norm(o.value).includes(n))) continue;
    out.push(p);
  }
  return out;
}

const pv = p => ({ '@type': 'PropertyValue', name: p.name, value: p.value });

/* Výrobek. Ve variantě D jako Service (výroba na zakázku, bez ceny): Google
   u Product bez offers/review/aggregateRating hlásí chybu, u Service nic
   nevyžaduje. Service nemá `material`, proto materiály jdou do additionalProperty. */
function vyrobek(pr, url, lang, variant) {
  const asService = variant === 'D';
  const props = vlastnosti(pr, lang, { materialy: asService }).map(pv);
  return {
    '@type': asService ? 'Service' : 'Product',
    '@id': `${url}#${pr.key}`,
    name: v(pr.name),
    description: v(pr.description),
    url: pr.anchor ? `${url}#${pr.anchor}` : url,
    image: pr.image ? pr.image.src : undefined,
    material: !asService && (pr.materials || []).length ? pr.materials.map(v) : undefined,
    additionalProperty: props.length ? props : undefined,
    provider: asService ? ORG : undefined,
    manufacturer: asService ? undefined : ORG
  };
}

function build(d, variant = VARIANTA) {
  const lang = d.lang;
  const ui = UI[lang];
  const url = d.url;
  const home = `${BASE}${LOCALES[lang].prefix}`;
  const products = (d.products || []).map(pr => vyrobek(pr, url, lang, variant));

  const page = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: v(d.page.name),
    description: v(d.page.description),
    inLanguage: lang,
    isPartOf: WEBSITE,
    publisher: ORG,
    breadcrumb: { '@id': `${url}#breadcrumb` }
  };

  const crumbs = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui.home, item: home },
      { '@type': 'ListItem', position: 2, name: ui.produkty, item: `${home}/produkty` },
      { '@type': 'ListItem', position: 3, name: v(d.page.name), item: url }
    ]
  };

  const graph = [page, crumbs];

  // Služba výroby na zakázku s katalogem; výrobky jako itemOffered bez ceny.
  const service = {
    '@type': 'Service',
    '@id': `${url}#sluzba`,
    name: v(d.page.name),
    description: v(d.page.description),
    provider: ORG,
    url,
    additionalProperty: (d.page.properties || []).length
      ? d.page.properties.map(p => pv({ name: v(p.name), value: v(p.value) })) : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': `${url}#katalog`,
      name: v(d.page.name),
      itemListElement: products.map(p => ({ '@type': 'Offer', itemOffered: p }))
    }
  };
  page.mainEntity = { '@id': service['@id'] };
  graph.push(service);

  if ((d.faq || []).length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang,
      isPartOf: { '@id': `${url}#webpage` },
      mainEntity: d.faq.map(q => ({
        '@type': 'Question',
        name: v(q.question),
        acceptedAnswer: { '@type': 'Answer', text: v(q.answer) }
      }))
    });
  }

  return clean({ '@context': 'https://schema.org', '@graph': graph });
}

function load(slug, lang) {
  return JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.${lang}.json`), 'utf8'));
}

/* node scripts/ai-vrstva/jsonld.js [--variant D|A] [--out dir] — zapíše <slug>.<lang>.jsonld */
if (require.main === module) {
  const args = process.argv.slice(2);
  const opt = (n, def) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : def; };
  const variant = opt('--variant', VARIANTA);
  const out = opt('--out', path.join(DIR, 'jsonld'));
  fs.mkdirSync(out, { recursive: true });
  let n = 0;
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      if (!fs.existsSync(path.join(DIR, `${slug}.${lang}.json`))) continue;
      fs.writeFileSync(path.join(out, `${slug}.${lang}.jsonld`), JSON.stringify(build(load(slug, lang), variant), null, 2) + '\n');
      n++;
    }
  }
  console.log(`JSON-LD (varianta ${variant}): ${n} souborů → ${path.relative(process.cwd(), out)}`);
}

module.exports = { build, load, vlastnosti, UI, VARIANTA };
