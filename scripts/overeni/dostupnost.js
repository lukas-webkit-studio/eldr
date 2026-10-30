/* Důkaz dostupnosti popisu pro AI (issue #35). Spouští se po publikaci produkce
   (revize R2), funguje i na stagingu.

   Pro každou z 30 URL (10 produktových stránek × cs/en/de) a každého robota:
   - stáhne HTML s User-Agentem robota, bez JavaScriptu,
   - ověří HTTP 200, že stránka nemá noindex (meta robots ani X-Robots-Tag),
   - ověří, že v surovém HTML je právě jeden blok JSON-LD a že se shoduje
     se souborem v repu (data/ai-vrstva/jsonld/) — jiný nebo starý blok neprojde,
   - ověří, že robots.txt robotovi stránku povoluje (RFC 9309).
   Pro každou URL jednou zavolá validator.schema.org. Zkontroluje /llms.txt.

   Co test dokazuje a co ne: server dostal požadavek s hlavičkou robota
   a odpověděl obsahem s popisem pro AI. Neověřuje, že robot z vlastní IP
   adresy projde ochranou typu Cloudflare — to ukáže jen log serveru nebo
   nástroje provozovatelů (Google Search Console, Bing Webmaster Tools).

   node scripts/overeni/dostupnost.js [--base https://www.eldr.cz] [--out soubor.md] [--bez-validatoru]
*/
const fs = require('fs');
const path = require('path');
const { STRANKY, LOCALES, BASE, urlFor } = require('../ai-vrstva/stranky');
const { DIR } = require('../ai-vrstva/udaje');
const { validate } = require('../ai-vrstva/validator');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const base = opt('--base', BASE).replace(/\/$/, '');
const out = opt('--out', null);
const noValidator = args.includes('--bez-validatoru');

/* User-Agent podle dokumentace provozovatelů (stav 10/2026). První položka = token pro robots.txt. */
const ROBOTI = [
  ['Googlebot', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
  ['Bingbot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/130.0.0.0 Safari/537.36'],
  ['GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)'],
  ['OAI-SearchBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)'],
  ['ChatGPT-User', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot'],
  ['PerplexityBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)'],
  ['ClaudeBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)']
];

/* robots.txt podle RFC 9309: skupiny se stejným tokenem se spojí, token se porovná
   bez verze a velikosti písmen, jiné řádky (Crawl-delay, Sitemap) skupinu neukončí.
   Platí nejdelší shoda; při shodné délce vyhrává Allow. */
function robotsAllows(txt, token, pathname) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const m = raw.replace(/#.*/, '').trim().match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) groups.push(cur = { agents: [], rules: [] });
      cur.agents.push(val.split('/')[0].toLowerCase());
      lastWasAgent = true;
    } else if (key === 'allow' || key === 'disallow') {
      lastWasAgent = false;
      if (cur && val) cur.rules.push({ allow: key === 'allow', path: val });
    }
  }
  const pick = name => groups.filter(g => g.agents.includes(name)).flatMap(g => g.rules);
  const rules = pick(token.toLowerCase()).length || groups.some(g => g.agents.includes(token.toLowerCase()))
    ? pick(token.toLowerCase()) : pick('*');
  let best = null;
  for (const r of rules) {
    const re = new RegExp('^' + r.path.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\$$/, '$'));
    if (!re.test(pathname)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return !best || best.allow;
}

function sameJson(a, b) {
  const keys = new Set();
  JSON.stringify([a, b], (k, v) => { keys.add(k); return v; });
  const order = [...keys].sort();
  return JSON.stringify(a, order) === JSON.stringify(b, order);
}

function checkPage(html, headers, want) {
  const errs = [];
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) || /noindex/i.test(headers.get('x-robots-tag') || '')) errs.push('noindex');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (blocks.length !== 1) errs.push(`JSON-LD bloků ${blocks.length}`);
  else {
    try {
      if (!sameJson(JSON.parse(blocks[0].replace(/<\\\//g, '</')), want)) errs.push('JSON-LD jiný než v repu');
    } catch (e) { errs.push('neplatný JSON-LD'); }
  }
  return errs;
}

async function main() {
  let bad = 0;
  const robotsRes = await fetch(`${base}/robots.txt`);
  const robotsTxt = robotsRes.status === 200 ? await robotsRes.text() : '';
  if (robotsRes.status !== 200) bad++;

  const rows = [];
  const valRows = [];
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const p = new URL(urlFor(slug, lang)).pathname;
      const url = base + p;
      const want = JSON.parse(fs.readFileSync(path.join(DIR, 'jsonld', `${slug}.${lang}.jsonld`), 'utf8'));
      const cells = [];
      for (const [token, ua] of ROBOTI) {
        let errs;
        try {
          const res = await fetch(url, { headers: { 'User-Agent': ua }, redirect: 'manual' });
          errs = res.status === 200 ? checkPage(await res.text(), res.headers, want) : [`HTTP ${res.status}`];
        } catch (e) { errs = [`síť: ${e.message}`]; }
        if (!robotsAllows(robotsTxt, token, p)) errs.push('robots.txt zakazuje');
        if (errs.length) bad++;
        cells.push(errs.length ? `❌ ${errs.join(', ')}` : '✅');
      }
      rows.push(`| \`${p}\` | ${cells.join(' | ')} |`);
      if (!noValidator) {
        try {
          const r = await validate(url);
          if (r.errors || r.fetchError) bad++;
          valRows.push(`| \`${p}\` | ${r.fetchError || 'OK'} | ${r.types.join(', ')} | ${r.errors} | ${r.warnings} |`);
        } catch (e) {
          bad++;
          valRows.push(`| \`${p}\` | chyba validátoru: ${e.message} | | | |`);
        }
      }
    }
  }

  const llmsRes = await fetch(`${base}/llms.txt`);
  const llmsTxt = llmsRes.status === 200 ? await llmsRes.text() : '';
  const llmsSame = llmsTxt.trim() === fs.readFileSync(path.join(DIR, 'llms.txt'), 'utf8').trim();
  if (!llmsSame) bad++;

  const md = [
    `# Dostupnost popisu pro AI — ${base}`,
    '',
    `Spuštěno ${new Date().toISOString()}. HTML stažené bez JavaScriptu s User-Agentem daného robota. ✅ = HTTP 200, bez noindex, právě jeden blok JSON-LD shodný s repem a robots.txt stránku robotovi povoluje. Test neověřuje průchod ochranou serveru podle IP adresy robota.`,
    '',
    `| URL | ${ROBOTI.map(r => r[0]).join(' | ')} |`,
    `|---|${ROBOTI.map(() => '---').join('|')}|`,
    ...rows,
    '',
    noValidator ? '_Validátor schema.org vynechán (--bez-validatoru)._' : '## validator.schema.org (URL)\n\n| URL | Načtení | Typy | Chyby | Varování |\n|---|---|---|---|---|\n' + valRows.join('\n'),
    '',
    '## robots.txt',
    '',
    `HTTP ${robotsRes.status}`,
    '',
    '```',
    robotsTxt.trim(),
    '```',
    '',
    `## /llms.txt\n\nHTTP ${llmsRes.status}, ${llmsSame ? 'shoduje se s `data/ai-vrstva/llms.txt`' : '**neshoduje se s repem nebo chybí**'}`,
    '',
    `**Výsledek: ${bad ? `${bad} problémů` : 'vše v pořádku'}.**`
  ].join('\n') + '\n';

  if (out) fs.writeFileSync(out, md);
  console.log(md);
  process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { robotsAllows };
