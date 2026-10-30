/* Test dohledatelnosti vrstvy pro AI (issue #35).

   Každý textový údaj v data/ai-vrstva/<slug>.<lang>.json se po normalizaci
   musí najít ve viditelném textu zdrojové stránky (snímek v _zdroj/).
   `value` musí ležet uvnitř `quote` a `quote` ve snímku. Obrázek musí být
   na stránce. Výsledek: počet údajů a podíl dohledaných — musí být 100 %.

   Spuštění: node scripts/ai-vrstva/test-dohledatelnost.js [--live]
   --live   místo uloženého snímku vyrenderuje aktuální stránku (Playwright).
            Tím se zjistí, jestli se text webu od snímku nezměnil.
*/
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { STRANKY, LOCALES, urlFor } = require('./stranky');
const { DIR, norm, facts } = require('./udaje');

function check(data, text, outline) {
  const errors = [];
  const hay = norm(text.split('\n').join(' '));
  const all = facts(data);
  let found = 0;
  for (const f of all) {
    const v = norm(f.value || ''), q = norm(f.quote || '');
    if (!v || !q) errors.push(`${f.path}: prázdná hodnota nebo citace`);
    else if (!q.includes(v)) errors.push(`${f.path}: hodnota není uvnitř citace\n      value: ${v}\n      quote: ${q}`);
    else if (!hay.includes(q)) errors.push(`${f.path}: citace není na stránce\n      quote: ${q}`);
    else found++;
  }
  const imgs = new Set(outline.blocks.filter(b => b.type === 'img').map(b => b.src));
  const anchors = new Set(outline.blocks.map(b => b.anchor).filter(Boolean));
  (data.products || []).forEach(pr => {
    if (!/^[a-z0-9-]+$/.test(pr.key || '')) errors.push(`${pr.key}: klíč musí být a-z0-9-`);
    if (pr.anchor && !anchors.has(pr.anchor)) errors.push(`${pr.key}: kotva #${pr.anchor} na stránce není`);
    if (pr.image && !imgs.has(pr.image.src)) errors.push(`${pr.key}: obrázek není na stránce (${pr.image.src})`);
  });
  const keys = (data.products || []).map(p => p.key);
  if (new Set(keys).size !== keys.length) errors.push('duplicitní klíč výrobku');
  return { total: all.length, found, errors };
}

/* Živý snímek jedné stránky ve všech jazycích (snapshot.js renderuje všechny tři najednou). */
function liveSnapshot(slug) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-vrstva-'));
  try {
    execFileSync('node', [path.join(__dirname, 'snapshot.js'), '--out', tmp, slug], { stdio: ['ignore', 'ignore', 'inherit'] });
    const out = {};
    for (const lang of Object.keys(LOCALES)) out[lang] = readSnapshot(tmp, slug, lang);
    return out;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function readSnapshot(dir, slug, lang) {
  return {
    text: fs.readFileSync(path.join(dir, `${slug}.${lang}.txt`), 'utf8'),
    outline: JSON.parse(fs.readFileSync(path.join(dir, `${slug}.${lang}.outline.json`), 'utf8'))
  };
}

function main() {
  const live = process.argv.includes('--live');
  let total = 0, found = 0, files = 0, fail = 0;
  const cache = {};
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const file = path.join(DIR, `${slug}.${lang}.json`);
      if (!fs.existsSync(file)) { console.log(`  ❌ ${slug}.${lang}.json chybí`); fail++; continue; }
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (live && !cache[slug]) cache[slug] = liveSnapshot(slug);
      const src = live ? cache[slug][lang] : readSnapshot(path.join(DIR, '_zdroj'), slug, lang);
      const meta = [];
      if (data.slug !== slug) meta.push(`slug ${data.slug} ≠ ${slug}`);
      if (data.lang !== lang) meta.push(`lang ${data.lang} ≠ ${lang}`);
      if (data.url !== urlFor(slug, lang)) meta.push(`url ${data.url} ≠ ${urlFor(slug, lang)}`);
      const r = check(data, src.text, src.outline);
      r.errors.unshift(...meta);
      files++; total += r.total; found += r.found;
      if (r.errors.length) {
        fail++;
        console.log(`  ❌ ${slug}.${lang}: ${r.found}/${r.total}`);
        r.errors.forEach(e => console.log('     ' + e));
      } else {
        console.log(`  ✅ ${slug}.${lang}: ${r.found}/${r.total} údajů dohledáno`);
      }
    }
  }
  // Firemní údaje v llms.txt: doslovné citace z patičky.
  const { CITACE } = require('./llms');
  const foot = norm(fs.readFileSync(path.join(DIR, '_zdroj', 'pylony-a-totemy.cs.txt'), 'utf8').split('\n').join(' '));
  for (const [k, q] of Object.entries(CITACE)) {
    total++;
    if (foot.includes(norm(q))) found++;
    else { fail++; console.log(`  ❌ llms.txt ${k}: citace není na stránce: ${q}`); }
  }
  const pct = total ? ((found / total) * 100).toFixed(1) : '0.0';
  console.log(`\nDohledatelnost: ${files} souborů, ${found}/${total} údajů (${pct} %)${live ? ' — živý web' : ''}`);
  if (fail || found !== total || files !== STRANKY.length * Object.keys(LOCALES).length) process.exit(1);
}

if (require.main === module) main();
module.exports = { check };
