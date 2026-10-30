/* Kontrola zápisu do Webflow: v surovém HTML (bez JS) každé z 30 URL musí být
   právě jeden blok JSON-LD a musí se shodovat se souborem v repu
   (data/ai-vrstva/jsonld/<slug>.<lang>.jsonld). Starý blok Organization
   z custom code stránky nesmí zůstat.
   node scripts/ai-vrstva/kontrola-webu.js [--base https://eldr.webflow.io] */
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, BASE } = require('./stranky');

const args = process.argv.slice(2);
const i = args.indexOf('--base');
const base = i >= 0 ? args[i + 1] : BASE;
const DIR = path.join(__dirname, '..', '..', 'data', 'ai-vrstva', 'jsonld');

const canon = o => JSON.stringify(o, Object.keys(flatKeys(o)).sort());
function flatKeys(o, acc = {}) {
  if (Array.isArray(o)) o.forEach(x => flatKeys(x, acc));
  else if (o && typeof o === 'object') Object.keys(o).forEach(k => { acc[k] = 1; flatKeys(o[k], acc); });
  return acc;
}

(async () => {
  let ok = 0, bad = 0;
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const url = `${base}${LOCALES[lang].prefix}/produkty/${slug}?nocache=${Date.now()}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; eldr-kontrola/1.0)' } });
      const html = await res.text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
      const want = JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.${lang}.jsonld`), 'utf8'));
      const errs = [];
      if (res.status !== 200) errs.push(`HTTP ${res.status}`);
      if (blocks.length !== 1) errs.push(`bloků JSON-LD: ${blocks.length} (má být 1)`);
      let got = null;
      try { got = blocks.length ? JSON.parse(blocks[0].replace(/<\\\//g, '</')) : null; } catch (e) { errs.push('neplatný JSON: ' + e.message); }
      if (got && canon(got) !== canon(want)) errs.push('obsah se liší od repa');
      if (/"@type"\s*:\s*"Organization"\s*,\s*"name"/.test(html)) errs.push('zůstal starý blok Organization');
      if (errs.length) { bad++; console.log(`❌ ${slug}.${lang}: ${errs.join('; ')}`); }
      else { ok++; console.log(`✅ ${slug}.${lang}`); }
    }
  }
  console.log(`\n${base}: ${ok}/${ok + bad} URL v pořádku`);
  process.exit(bad ? 1 : 0);
})();
