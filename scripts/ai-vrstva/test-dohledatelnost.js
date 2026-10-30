/* Test dohledatelnosti vrstvy pro AI (issue #35).

   Každý textový údaj v data/ai-vrstva/<slug>.<lang>.json se po normalizaci
   musí najít ve viditelném textu zdrojové stránky (snímek v _zdroj/).
   `value` musí ležet uvnitř `quote` a `quote` ve snímku. Obrázek musí být
   na stránce. Výsledek: počet údajů a podíl dohledaných — musí být 100 %.

   Spuštění: node scripts/ai-vrstva/test-dohledatelnost.js [--live]
   --live   místo uloženého snímku stáhne aktuální stránku (vyžaduje Playwright)
*/
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, urlFor } = require('./stranky');

const DIR = path.join(__dirname, '..', '..', 'data', 'ai-vrstva');

const norm = s => String(s)
  .normalize('NFC')
  .replace(/[­​-‍⁠﻿]/g, '')
  .replace(/[“”„‟«»″]/g, '"')
  .replace(/[‘’‚‛′]/g, "'")
  .replace(/[‐-―−]/g, '-')
  .replace(/[\s     ]+/g, ' ')
  .trim();

/* Projde údaje souboru stránky a vrátí je jako [{path, value, quote}]. */
function facts(data) {
  const out = [];
  const add = (p, f) => { if (f) out.push({ path: p, value: f.value, quote: f.quote }); };
  const list = (p, arr) => (arr || []).forEach((f, i) => add(`${p}[${i}]`, f));
  add('page.name', data.page && data.page.name);
  add('page.description', data.page && data.page.description);
  list('page.highlights', data.page && data.page.highlights);
  ((data.page && data.page.properties) || []).forEach((pp, j) => {
    add(`page.properties[${j}].name`, pp.name);
    add(`page.properties[${j}].value`, pp.value);
  });
  (data.products || []).forEach((pr, i) => {
    const p = `products[${i}:${pr.key}]`;
    add(`${p}.name`, pr.name);
    add(`${p}.description`, pr.description);
    (pr.properties || []).forEach((pp, j) => {
      add(`${p}.properties[${j}].name`, pp.name);
      add(`${p}.properties[${j}].value`, pp.value);
    });
    list(`${p}.materials`, pr.materials);
    list(`${p}.variants`, pr.variants);
    list(`${p}.uses`, pr.uses);
  });
  (data.faq || []).forEach((q, i) => {
    add(`faq[${i}].question`, q.question);
    add(`faq[${i}].answer`, q.answer);
  });
  return out;
}

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

async function liveSnapshot(slug, lang) {
  const { execFileSync } = require('child_process');
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ai-vrstva-'));
  execFileSync('node', [path.join(__dirname, 'snapshot.js'), '--out', tmp, slug], { stdio: 'ignore' });
  return {
    text: fs.readFileSync(path.join(tmp, `${slug}.${lang}.txt`), 'utf8'),
    outline: JSON.parse(fs.readFileSync(path.join(tmp, `${slug}.${lang}.outline.json`), 'utf8'))
  };
}

async function main() {
  const live = process.argv.includes('--live');
  let total = 0, found = 0, files = 0, fail = 0;
  const cache = {};
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const file = path.join(DIR, `${slug}.${lang}.json`);
      if (!fs.existsSync(file)) { console.log(`  ❌ ${slug}.${lang}.json chybí`); fail++; continue; }
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      let src;
      if (live) {
        cache[slug] = cache[slug] || {};
        src = cache[slug][lang] || (cache[slug][lang] = await liveSnapshot(slug, lang));
      } else {
        src = {
          text: fs.readFileSync(path.join(DIR, '_zdroj', `${slug}.${lang}.txt`), 'utf8'),
          outline: JSON.parse(fs.readFileSync(path.join(DIR, '_zdroj', `${slug}.${lang}.outline.json`), 'utf8'))
        };
      }
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
  if (fail || found !== total || files !== STRANKY.length * 3) process.exit(1);
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { norm, facts, check };
