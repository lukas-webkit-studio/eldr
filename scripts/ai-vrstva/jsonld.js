/* Generátor JSON-LD z dat vrstvy pro AI (issue #35).

   Každá hodnota pochází z data/ai-vrstva/<slug>.<lang>.json, kde má doslovnou
   citaci ze stránky. Generátor nic nepřidává kromě identifikátorů (@id),
   URL a popisků polí (`PropertyValue.name` u provedení a použití).

   Konvence společné s S6 (#34): jeden @graph na stránku, firma jen odkazem
   https://www.eldr.cz/#organization, web https://www.eldr.cz/#website,
   stránka <URL>#webpage, drobečky <URL>#breadcrumb, položky <URL>#<klíč>,
   URL bez lomítka na konci, inLanguage cs/en/de.

   Varianta modelu se volí parametrem (A/B/C/D), vybraná je VARIANTA níž —
   výsledky testů jsou v docs/decisions.md.
*/
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, BASE } = require('./stranky');

const VARIANTA = 'D';
const DIR = path.join(__dirname, '..', '..', 'data', 'ai-vrstva');

/* Odkazy nesou @type, jinak validátor na samotné stránce uzel nezná
   (plný popis firmy a webu je jen na homepage, lane S6). */
const ORG = { '@type': 'Organization', '@id': `${BASE}/#organization` };
const WEBSITE = { '@type': 'WebSite', '@id': `${BASE}/#website` };

/* Popisky navigace a polí. Nejsou to údaje o výrobku, jen názvy. */
const UI = {
  cs: { home: 'Domů', produkty: 'Produkty', variant: 'Provedení', use: 'Použití', material: 'Materiál' },
  en: { home: 'Home', produkty: 'Products', variant: 'Variant', use: 'Use', material: 'Material' },
  de: { home: 'Startseite', produkty: 'Produkte', variant: 'Ausführung', use: 'Einsatz', material: 'Material' }
};

const v = f => (f && f.value ? f.value.trim() : undefined);
const clean = o => JSON.parse(JSON.stringify(o)); // zahodí undefined a prázdné hodnoty

function pv(name, value) {
  return { '@type': 'PropertyValue', name, value };
}

/* Výrobek. Ve variantě D jako Service (výroba na zakázku, bez ceny):
   Google u Service nehlásí chybějící offers/review/aggregateRating, které
   u Product bez ceny hlásí. Materiály jdou do additionalProperty, protože
   Service nemá vlastnost `material`. */
function product(d, pr, url, ui, variant) {
  const asService = variant === 'D';
  const props = [
    ...(pr.properties || []).map(p => pv(v(p.name), v(p.value))),
    ...(asService ? (pr.materials || []).map(f => pv(ui.material, v(f))) : []),
    ...(pr.variants || []).map(f => pv(ui.variant, v(f))),
    ...(pr.uses || []).map(f => pv(ui.use, v(f)))
  ];
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
  const products = (d.products || []).map(pr => product(d, pr, url, ui, variant));
  const refs = products.map(p => ({ '@id': p['@id'] }));

  const page = {
    '@type': variant === 'B' ? 'CollectionPage' : 'WebPage',
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
      { '@type': 'ListItem', position: 1, name: ui.home, item: home || BASE },
      { '@type': 'ListItem', position: 2, name: ui.produkty, item: `${home}/produkty` },
      { '@type': 'ListItem', position: 3, name: v(d.page.name), item: url }
    ]
  };

  const graph = [page, crumbs];

  if (variant === 'A' || variant === 'D') {
    // Služba výroby na zakázku s katalogem; výrobky jako itemOffered bez ceny.
    const service = {
      '@type': 'Service',
      '@id': `${url}#sluzba`,
      name: v(d.page.name),
      description: v(d.page.description),
      provider: ORG,
      url,
      additionalProperty: ((d.page.properties || []).length && variant === 'D')
        ? d.page.properties.map(p => pv(v(p.name), v(p.value))) : undefined,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        '@id': `${url}#katalog`,
        name: v(d.page.name),
        itemListElement: products.map(p => ({ '@type': 'Offer', itemOffered: p }))
      }
    };
    page.mainEntity = { '@id': service['@id'] };
    graph.push(service);
  } else if (variant === 'B') {
    // Výpis výrobků na stránce, výrobky jako samostatné uzly.
    const list = {
      '@type': 'ItemList',
      '@id': `${url}#vyrobky`,
      name: v(d.page.name),
      numberOfItems: products.length,
      itemListElement: refs.map((r, i) => ({ '@type': 'ListItem', position: i + 1, item: r }))
    };
    page.mainEntity = { '@id': list['@id'] };
    graph.push(list, ...products);
  } else if (variant === 'C') {
    // Jako A, ale výrobky jsou rovnou v Offer.itemOffered a stránka je popisuje
    // přes `about` (bez samostatného uzlu Service).
    const catalog = {
      '@type': 'OfferCatalog',
      '@id': `${url}#katalog`,
      name: v(d.page.name),
      offeredBy: ORG,
      itemListElement: products.map(p => ({ '@type': 'Offer', offeredBy: ORG, itemOffered: p }))
    };
    page.mainEntity = { '@id': catalog['@id'] };
    graph.push(catalog);
  }

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

/* node scripts/ai-vrstva/jsonld.js [--variant A|B|C] [--out dir] — zapíše <slug>.<lang>.jsonld */
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

module.exports = { build, load, VARIANTA };
