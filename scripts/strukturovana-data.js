#!/usr/bin/env node
/**
 * Strukturovaná data (JSON-LD) pro eldr.cz — stavba a validace.
 *
 * Zdroj pravdy: data/strukturovana-data/firma.json a stranky.json.
 * Výstup:       data/strukturovana-data/vystup/<klic>.<jazyk>.json
 *               (přesně to, co se zapisuje do Webflow přes
 *               data_pages_tool > bulk_update_pages_schema_markup).
 *
 * Proč ne JS na webu: AI roboti JS nespouštějí, JSON-LD musí být v surovém
 * HTML. Webflow ho umí nativně (schema markup stránky), takže kód v repu
 * jen staví a hlídá data, na web nic nevkládá.
 *
 *   node scripts/strukturovana-data.js            # postaví a zvaliduje (npm run check)
 *   node scripts/strukturovana-data.js --webflow  # vypíše payloady pro MCP po 25
 *   node scripts/strukturovana-data.js --live https://eldr.webflow.io
 *                                                 # stáhne stránky a zkontroluje
 *                                                 # vypsaný JSON-LD proti výstupu
 *   node scripts/strukturovana-data.js --slovnik <schemaorg-current-https.jsonld>
 *                                                 # obnoví výřez slovníku schema.org
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'strukturovana-data');
const OUT = path.join(DIR, 'vystup');
const SLOVNIK = path.join(DIR, 'schemaorg-vyrez.json');
const WEB = 'https://www.eldr.cz';
const ORG = WEB + '/#organization';
const SITE = WEB + '/#website';

const firma = JSON.parse(fs.readFileSync(path.join(DIR, 'firma.json'), 'utf8'));
const cfg = JSON.parse(fs.readFileSync(path.join(DIR, 'stranky.json'), 'utf8'));
const JAZYKY = Object.keys(cfg.locales);

// ---------------------------------------------------------------- stavba

const ref = (id) => ({ '@id': id });
const domov = (j) => WEB + cfg.locales[j].prefix;
const urlStranky = (j, cesta) => WEB + cfg.locales[j].prefix + cesta;
// Fragment na holé doméně normalizuje každý parser na "/#…", proto ho tak i píšeme.
const kotva = (url, k) => (url === WEB ? WEB + '/#' + k : url + '#' + k);

// Vazba na pole CMS ve schema markup šablony. Ověřeno na stagingu 30. 10. 2026:
// Webflow ji při publikaci nahradí hodnotou pole v daném jazyce.
const wf = (p) => '{{wf {&quot;path&quot;:&quot;' + p.path + '&quot;,&quot;type&quot;:&quot;' + p.type + '&quot;} }}';

function oteviraciDoba() {
  const o = firma.otviraciDoba;
  return { '@type': 'OpeningHoursSpecification', dayOfWeek: o.dny, opens: o.od, closes: o.do };
}

function organizace(j) {
  const k = firma.kancelarPraha;
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG,
    name: firma.name,
    legalName: firma.legalName,
    alternateName: firma.alternateName,
    url: WEB,
    logo: { '@type': 'ImageObject', url: firma.logo.url, width: firma.logo.width, height: firma.logo.height },
    image: firma.image,
    description: firma.popis[j],
    identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: firma.ico },
    vatID: firma.vatID,
    telephone: firma.telephone,
    email: firma.email,
    address: { '@type': 'PostalAddress', ...firma.sidlo },
    location: {
      '@type': 'Place',
      name: k.name[j],
      description: k.description[j],
      address: {
        '@type': 'PostalAddress',
        streetAddress: k.address.streetAddress,
        addressLocality: k.address.addressLocality[j],
        postalCode: k.address.postalCode,
        addressCountry: k.address.addressCountry
      }
    },
    openingHoursSpecification: oteviraciDoba(),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: firma.telephone,
      email: firma.email,
      hoursAvailable: oteviraciDoba()
    },
    sameAs: firma.sameAs
  };
}

function web(j) {
  return {
    '@type': 'WebSite',
    '@id': SITE,
    url: WEB,
    name: firma.name,
    alternateName: firma.alternateName,
    inLanguage: j,
    publisher: ref(ORG)
  };
}

function drobecky(j, url, polozky) {
  return {
    '@type': 'BreadcrumbList',
    '@id': url + '#breadcrumb',
    itemListElement: polozky.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, item: p.item }))
  };
}

function stranka(s, j, url, nazev, popis, typ) {
  const n = { '@type': typ || s.typ, '@id': kotva(url, 'webpage'), url, name: nazev };
  if (popis) n.description = popis;
  n.inLanguage = j;
  n.isPartOf = ref(SITE);
  n.publisher = ref(ORG);
  return n;
}

function graf(s, j) {
  const rodic = s.rodic ? cfg.stranky.find((x) => x.klic === s.rodic) : null;
  const url = urlStranky(j, s.sablona ? s.cesta.replace('{slug}', wf(s.pole.slug)) : s.cesta);
  const g = [];

  if (s.sablona) {
    const nazev = wf(s.pole.nazev);
    const wp = stranka(s, j, url, nazev, s.pole.popis ? wf(s.pole.popis) : null, 'WebPage');
    wp.breadcrumb = ref(url + '#breadcrumb');
    g.push(wp);
    if (s.sablona === 'clanek') {
      wp.mainEntity = ref(url + '#article');
      g.push({
        '@type': 'BlogPosting',
        '@id': url + '#article',
        headline: nazev,
        description: wf(s.pole.popis),
        image: wf(s.pole.obrazek),
        datePublished: wf(s.pole.datePublished),
        dateModified: wf(s.pole.dateModified),
        // Google u článku čte author.name a publisher.name z téhle stránky, odkaz
        // na uzel z homepage nerozbalí. Proto pojmenovaný odkaz, ne plný popis.
        author: { '@type': 'Organization', '@id': ORG, name: firma.name, url: WEB },
        publisher: { '@type': 'Organization', '@id': ORG, name: firma.name, url: WEB, logo: firma.logo.url },
        inLanguage: j,
        mainEntityOfPage: ref(url + '#webpage'),
        isPartOf: ref(SITE)
      });
    }
    g.push(
      drobecky(j, url, [
        { name: cfg.domu[j], item: domov(j) },
        { name: rodic.nazev[j], item: urlStranky(j, rodic.cesta) },
        { name: nazev, item: url }
      ])
    );
  } else {
    const wp = stranka(s, j, url, s.nazev[j], s.popis && s.popis[j]);
    g.push(wp);
    if (s.klic === 'domu') {
      wp.about = ref(ORG);
      g.unshift(organizace(j), web(j));
    } else {
      if (s.oFirme) wp.about = ref(ORG);
      wp.breadcrumb = ref(url + '#breadcrumb');
      g.push(
        drobecky(j, url, [
          { name: cfg.domu[j], item: domov(j) },
          { name: s.nazev[j], item: url }
        ])
      );
    }
    if (s.seznam) {
      wp.mainEntity = ref(url + '#itemlist');
      g.push({
        '@type': 'ItemList',
        '@id': url + '#itemlist',
        numberOfItems: s.seznam.length,
        itemListElement: s.seznam.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.nazev[j],
          url: urlStranky(j, p.cesta)
        }))
      });
    }
    if (s.sluzby) {
      wp.mainEntity = s.sluzby.map((x) => ref(url + '#' + x.kotva));
      s.sluzby.forEach((x) =>
        g.push({ '@type': 'Service', '@id': url + '#' + x.kotva, name: x.nazev[j], provider: ref(ORG), url })
      );
    }
  }
  return { '@context': 'https://schema.org', '@graph': g };
}

function postav() {
  const vysledek = [];
  for (const s of cfg.stranky) for (const j of JAZYKY) vysledek.push({ s, j, data: graf(s, j) });
  return vysledek;
}

// ---------------------------------------------------------------- validace

const ZAKAZANE_TYPY = ['Review', 'AggregateRating', 'Offer', 'AggregateOffer', 'JobPosting'];
const ZAKAZANE_KLICE = ['review', 'aggregateRating', 'offers', 'price', 'priceRange', 'priceCurrency'];
const URL_ELDR = /^https:\/\/www\.eldr\.cz(\/#[a-z-]+|(\/[^#\s]*[^/#\s])?(#[a-z-]+)?)$/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}]/u;
const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;
const jeVazba = (v) => typeof v === 'string' && v.includes('{{wf ');

let slovnik = null;
try {
  slovnik = JSON.parse(fs.readFileSync(SLOVNIK, 'utf8'));
} catch (e) {
  slovnik = null;
}

function typy(n) {
  return [].concat(n['@type'] || []);
}

function predci(t) {
  const out = new Set([t]);
  const fronta = [t];
  while (fronta.length) {
    const x = fronta.pop();
    for (const p of (slovnik.tridy[x] || [])) if (!out.has(p)) out.add(p), fronta.push(p);
  }
  return out;
}

/** Vrátí seznam chyb. ctx = { j, url, domu, sablona } */
function validuj(doc, ctx) {
  const ch = [];
  const err = (m) => ch.push(m);
  if (doc['@context'] !== 'https://schema.org') err('@context musí být "https://schema.org"');
  if (!Array.isArray(doc['@graph'])) return err('chybí @graph'), ch;
  const navic = Object.keys(doc).filter((k) => k !== '@context' && k !== '@graph');
  if (navic.length) err('na nejvyšší úrovni jen @context a @graph, je tu i ' + navic.join(', '));

  const uzly = doc['@graph'];
  const ids = new Map();
  uzly.forEach((n) => {
    if (!n['@id']) err('uzel ' + typy(n).join('/') + ' nemá @id');
    else if (ids.has(n['@id'])) err('duplicitní @id ' + n['@id']);
    else ids.set(n['@id'], n);
  });

  // průchod všemi hodnotami
  const odkazy = [];
  (function projdi(v, cesta, rodic) {
    if (Array.isArray(v)) return v.forEach((x, i) => projdi(x, cesta + '[' + i + ']', rodic));
    if (v && typeof v === 'object') {
      const t = typy(v);
      t.forEach((x) => ZAKAZANE_TYPY.includes(x) && err('zakázaný typ ' + x + ' (' + cesta + ')'));
      const klice = Object.keys(v);
      if (klice.length === 1 && klice[0] === '@id') odkazy.push(v['@id']);
      for (const k of klice) {
        if (ZAKAZANE_KLICE.includes(k)) err('zakázaná vlastnost ' + k + ' (' + cesta + ')');
        if (slovnik && t.length && !k.startsWith('@')) {
          const ok = t.some((tt) => {
            if (!slovnik.tridy[tt]) return false;
            const p = slovnik.vlastnosti[k];
            return p && [...predci(tt)].some((x) => p.includes(x));
          });
          if (!ok) err('schema.org: ' + t.join('/') + ' nemá vlastnost ' + k + ' (' + cesta + ')');
        }
        projdi(v[k], cesta + '.' + k, v);
      }
      if (slovnik) t.forEach((tt) => !slovnik.tridy[tt] && err('schema.org: neznámý typ ' + tt));
      return;
    }
    if (typeof v === 'string') {
      if (!v.trim()) err('prázdný text (' + cesta + ')');
      if (EMOJI.test(v)) err('emoji v textu (' + cesta + ')');
      if (/eldr\.cz/.test(v) && /^https?:/.test(v) && !jeVazba(v) && !URL_ELDR.test(v))
        err('nekanonická URL ' + v + ' (' + cesta + ')');
      // Mezera na kraji (typicky z pole CMS) JSON-LD nerozbije, Google ji ořízne. Jen upozornění.
      if (/^\s|\s$/.test(v) && ctx.upozorneni) ctx.upozorneni.push('mezera na kraji textu (' + cesta + ')');
      else if (/^\s|\s$/.test(v)) err('mezera na kraji textu (' + cesta + ')');
    }
  })(uzly, '@graph');

  odkazy.forEach((id) => {
    if (!ids.has(id) && id !== ORG && id !== SITE) err('odkaz na neexistující uzel ' + id);
  });

  // firma a web jen na homepage
  const org = ids.get(ORG);
  // Pojmenovaný odkaz (jen @type, @id, name, url, logo) u článku není plný popis firmy.
  const plnyPopis = (n) => n && Object.keys(n).some((k) => !['@type', '@id', 'name', 'url', 'logo'].includes(k));
  const site = ids.get(SITE);
  if (ctx.domu) {
    if (!org) err('homepage musí mít plný popis firmy ' + ORG);
    if (!site) err('homepage musí mít WebSite ' + SITE);
  } else {
    if (org) err('plný popis firmy patří jen na homepage');
    (function hledej(v) {
      if (Array.isArray(v)) return v.forEach(hledej);
      if (v && typeof v === 'object') {
        if (v['@id'] === ORG && plnyPopis(v)) err('plný popis firmy patří jen na homepage');
        Object.values(v).forEach(hledej);
      }
    })(uzly);
    if (site) err('WebSite patří jen na homepage');
  }
  if (org) {
    ['name', 'legalName', 'url', 'logo', 'address', 'telephone', 'vatID', 'identifier'].forEach(
      (k) => org[k] || err('firma: chybí ' + k)
    );
    if (!typy(org).includes('Organization') || !typy(org).includes('LocalBusiness'))
      err('firma má být Organization + LocalBusiness');
  }
  if (site && site.inLanguage !== ctx.j) err('WebSite.inLanguage má být ' + ctx.j);

  // stránka
  const wpId = ctx.url === WEB ? WEB + '/#webpage' : ctx.url + '#webpage';
  const wp = ids.get(wpId);
  if (!wp) err('chybí uzel stránky ' + wpId);
  else {
    if (wp.url !== ctx.url) err('url stránky ' + wp.url + ' ≠ ' + ctx.url);
    if (wp.inLanguage !== ctx.j) err('inLanguage stránky ' + wp.inLanguage + ' ≠ ' + ctx.j);
    if (!wp.name) err('stránka nemá name');
    if (!wp.isPartOf || wp.isPartOf['@id'] !== SITE) err('stránka nemá isPartOf ' + SITE);
    if (!wp.publisher || wp.publisher['@id'] !== ORG) err('stránka nemá publisher ' + ORG);
  }
  uzly.forEach((n) => n.inLanguage && n.inLanguage !== ctx.j && err(typy(n) + '.inLanguage ≠ ' + ctx.j));

  // drobečky
  const bc = uzly.find((n) => typy(n).includes('BreadcrumbList'));
  if (ctx.domu) {
    if (bc) err('homepage drobečky nemá');
  } else if (!bc) err('chybí BreadcrumbList');
  else {
    if (bc['@id'] !== ctx.url + '#breadcrumb') err('drobečky mají @id ' + bc['@id']);
    if (!wp || !wp.breadcrumb || wp.breadcrumb['@id'] !== bc['@id']) err('stránka neodkazuje na drobečky');
    const li = bc.itemListElement || [];
    if (li.length < 2) err('drobečky mají méně než 2 položky');
    li.forEach((x, i) => {
      if (x.position !== i + 1) err('drobečky: pozice ' + x.position + ' na místě ' + (i + 1));
      if (!x.name || !x.item) err('drobečky: položka ' + (i + 1) + ' bez name nebo item');
    });
    if (li.length && li[0].item !== domov(ctx.j)) err('drobečky nezačínají domovskou stránkou jazyka');
    if (li.length && li[li.length - 1].item !== ctx.url) err('poslední drobeček není tahle stránka');
  }

  // článek
  uzly
    .filter((n) => typy(n).includes('BlogPosting'))
    .forEach((a) => {
      ['headline', 'image', 'datePublished', 'dateModified', 'author', 'publisher', 'mainEntityOfPage'].forEach(
        (k) => a[k] || err('BlogPosting: chybí ' + k)
      );
      ['datePublished', 'dateModified'].forEach(
        (k) => a[k] && !jeVazba(a[k]) && !ISO.test(a[k]) && err('BlogPosting.' + k + ' není ISO 8601: ' + a[k])
      );
      if (a.headline && !jeVazba(a.headline) && a.headline.length > 110)
        err('BlogPosting.headline delší než 110 znaků');
      if (a.image && !jeVazba(a.image) && !/^https:\/\//.test(a.image)) err('BlogPosting.image není URL');
    });
  return ch;
}

// ---------------------------------------------------------------- live kontrola

function jsonLdZHtml(html) {
  const out = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push({ text: m[1], vHead: m.index < html.indexOf('</head>') });
  return out;
}

async function live(zaklad) {
  const prace = [];
  for (const s of cfg.stranky)
    for (const j of JAZYKY) {
      const slugy = s.sablona ? s.polozky : [null];
      for (const slug of slugy) {
        const cesta = slug ? s.cesta.replace('{slug}', slug) : s.cesta;
        const prefix = cfg.locales[j].prefix;
        const kanon = WEB + prefix + cesta;
        prace.push({ s, j, slug, kanon, adresa: zaklad + (prefix + cesta || '/') });
      }
    }
  let chyb = 0;
  const radky = [];
  for (const p of prace) {
    const ch = [];
    const upoz = [];
    let html = '';
    try {
      const r = await fetch(p.adresa + (p.adresa.includes('?') ? '&' : '?') + 'sd=' + Date.now());
      if (!r.ok) ch.push('HTTP ' + r.status);
      html = await r.text();
    } catch (e) {
      ch.push('stažení selhalo: ' + e.message);
    }
    const bloky = jsonLdZHtml(html);
    if (bloky.length !== 1) ch.push('JSON-LD bloků: ' + bloky.length + ' (má být 1)');
    let typyNalez = '';
    if (bloky[0]) {
      if (!bloky[0].vHead) ch.push('JSON-LD není v <head>');
      let doc = null;
      try {
        doc = JSON.parse(bloky[0].text);
      } catch (e) {
        ch.push('neplatný JSON: ' + e.message);
      }
      if (doc) {
        ch.push(...validuj(doc, { j: p.j, url: p.kanon, domu: p.s.klic === 'domu', upozorneni: upoz }));
        if (!p.s.sablona) {
          const cil = JSON.stringify(graf(p.s, p.j));
          if (JSON.stringify(doc) !== cil) ch.push('liší se od data/strukturovana-data/vystup');
        } else if (JSON.stringify(doc).includes('{{wf')) ch.push('nenahrazená vazba CMS');
        typyNalez = [...new Set((doc['@graph'] || []).flatMap(typy))].join(', ');
      }
    }
    chyb += ch.length;
    radky.push({ url: p.adresa, jazyk: p.j, typy: typyNalez, chyby: ch, upozorneni: upoz });
    console.log((ch.length ? '✗ ' : '✓ ') + p.adresa + (typyNalez ? '  [' + typyNalez + ']' : ''));
    ch.forEach((c) => console.log('    ' + c));
    upoz.forEach((c) => console.log('    upozornění: ' + c));
  }
  fs.writeFileSync(path.join(OUT, '_live.json'), JSON.stringify({ zaklad, kdy: new Date().toISOString(), radky }, null, 2) + '\n');
  console.log('\n' + prace.length + ' URL, chyb: ' + chyb);
  return chyb;
}

// ---------------------------------------------------------------- výřez slovníku

function obnovSlovnik(soubor) {
  const vocab = JSON.parse(fs.readFileSync(soubor, 'utf8'))['@graph'];
  const id = (x) => String(x['@id'] || x).replace('schema:', '');
  const tridy = {};
  const vlastnosti = {};
  vocab.forEach((n) => {
    const t = [].concat(n['@type']);
    if (t.includes('rdfs:Class')) tridy[id(n)] = [].concat(n['rdfs:subClassOf'] || []).map(id);
    if (t.includes('rdf:Property')) vlastnosti[id(n)] = [].concat(n['schema:domainIncludes'] || []).map(id);
  });
  // Uloží jen to, co data používají, ať v repu není 1,5 MB slovníku.
  const pouzite = { tridy: new Set(), vlastnosti: new Set() };
  postav().forEach(({ data }) =>
    (function projdi(v) {
      if (Array.isArray(v)) return v.forEach(projdi);
      if (v && typeof v === 'object') {
        typy(v).forEach((t) => pouzite.tridy.add(t));
        Object.keys(v).forEach((k) => (k.startsWith('@') || pouzite.vlastnosti.add(k), projdi(v[k])));
      }
    })(data['@graph'])
  );
  const vyrez = { _zdroj: 'https://schema.org/version/latest/schemaorg-current-https.jsonld', tridy: {}, vlastnosti: {} };
  const pridejTridu = (t) => {
    if (vyrez.tridy[t] || !tridy[t]) return;
    vyrez.tridy[t] = tridy[t];
    tridy[t].forEach(pridejTridu);
  };
  pouzite.tridy.forEach(pridejTridu);
  pouzite.vlastnosti.forEach((p) => {
    if (vlastnosti[p]) vyrez.vlastnosti[p] = vlastnosti[p];
  });
  fs.writeFileSync(SLOVNIK, JSON.stringify(vyrez, null, 1) + '\n');
  console.log('výřez slovníku: ' + Object.keys(vyrez.tridy).length + ' typů, ' + Object.keys(vyrez.vlastnosti).length + ' vlastností');
}

// ---------------------------------------------------------------- main

async function main() {
  const arg = process.argv.slice(2);
  if (arg[0] === '--slovnik') return obnovSlovnik(arg[1]);
  if (arg[0] === '--live') process.exit((await live(arg[1].replace(/\/$/, ''))) ? 1 : 0);

  const vse = postav();
  if (!slovnik) console.warn('! chybí ' + path.relative(process.cwd(), SLOVNIK) + ', kontrola slovníku schema.org vynechána');
  fs.mkdirSync(OUT, { recursive: true });
  let chyb = 0;
  for (const { s, j, data } of vse) {
    const url = urlStranky(j, s.sablona ? s.cesta.replace('{slug}', wf(s.pole.slug)) : s.cesta);
    const ch = validuj(data, { j, url, domu: s.klic === 'domu' });
    const text = JSON.stringify(data, null, 2) + '\n';
    if (Buffer.byteLength(text) > 20000) ch.push('JSON-LD delší než 20 kB');
    fs.writeFileSync(path.join(OUT, s.klic + '.' + j + '.json'), text);
    ch.forEach((c) => console.error('✗ ' + s.klic + '.' + j + ': ' + c));
    chyb += ch.length;
  }
  if (arg[0] === '--webflow') {
    const polozky = vse.map(({ s, j, data }) => {
      const p = { id: s.pageId, jsonLdSchema: JSON.stringify(data) };
      if (cfg.locales[j].localeId) p.localeId = cfg.locales[j].localeId;
      return p;
    });
    for (let i = 0; i < polozky.length; i += 25)
      fs.writeFileSync(path.join(OUT, '_webflow-' + (i / 25 + 1) + '.json'), JSON.stringify(polozky.slice(i, i + 25)));
    console.log('payloady: ' + Math.ceil(polozky.length / 25) + ' × vystup/_webflow-N.json');
  }
  console.log('strukturovaná data: ' + vse.length + ' grafů, chyb: ' + chyb);
  if (chyb) process.exit(1);
}

main();
