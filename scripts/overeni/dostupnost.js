/* Důkaz dostupnosti vrstvy pro AI (issue #35, spouští R2 po publikaci produkce).

   Pro každou z 30 URL (10 produktových stránek × cs/en/de) a každého robota:
   - stáhne HTML s User-Agentem robota (bez JS),
   - ověří HTTP 200 a přítomnost platného JSON-LD v surovém HTML,
   - ověří, že robots.txt robotovi stránku povoluje.
   Pro každou URL jednou zavolá validator.schema.org.
   Navíc zkontroluje /llms.txt.

   node scripts/overeni/dostupnost.js [--base https://www.eldr.cz] [--out soubor.md] [--bez-validatoru]
*/
const fs = require('fs');
const { STRANKY, LOCALES } = require('../ai-vrstva/stranky');
const { validate } = require('../ai-vrstva/validator');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const base = opt('--base', 'https://www.eldr.cz').replace(/\/$/, '');
const out = opt('--out', null);
const noValidator = args.includes('--bez-validatoru');

/* User-Agent řetězce podle dokumentace provozovatelů (stav 10/2026). Token pro robots.txt je první položka. */
const ROBOTI = [
  ['Googlebot', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
  ['Bingbot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/130.0.0.0 Safari/537.36'],
  ['GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)'],
  ['OAI-SearchBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)'],
  ['ChatGPT-User', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot'],
  ['PerplexityBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)'],
  ['ClaudeBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)']
];

/* Minimální parser robots.txt: skupina podle tokenu, jinak '*'; nejdelší shoda Allow/Disallow vyhrává. */
function robotsAllows(txt, token, pathname) {
  const groups = [];
  let cur = null;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, val] = [m[0], m[1].toLowerCase(), m[2].trim()];
    if (key === 'user-agent') {
      if (!cur || cur.rules.length) groups.push(cur = { agents: [], rules: [] });
      cur.agents.push(val.toLowerCase());
    } else if ((key === 'allow' || key === 'disallow') && cur) {
      cur.rules.push({ allow: key === 'allow', path: val });
    }
  }
  const pick = groups.find(g => g.agents.includes(token.toLowerCase())) || groups.find(g => g.agents.includes('*'));
  if (!pick) return true;
  let best = null;
  for (const r of pick.rules) {
    if (!r.path) continue;
    const re = new RegExp('^' + r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (re.test(pathname) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return !best || best.allow;
}

function jsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  let valid = 0, types = [];
  for (const b of blocks) {
    try {
      const o = JSON.parse(b.replace(/<\\\//g, '</'));
      valid++;
      (o['@graph'] || [o]).forEach(n => types.push([].concat(n['@type']).join('+')));
    } catch (e) { /* neplatný blok se počítá jako chyba */ }
  }
  return { count: blocks.length, valid, types };
}

(async () => {
  const robotsTxt = await (await fetch(`${base}/robots.txt`)).text();
  const rows = [];
  const valRows = [];
  let bad = 0;
  for (const { slug } of STRANKY) {
    for (const lang of Object.keys(LOCALES)) {
      const p = `${LOCALES[lang].prefix}/produkty/${slug}`;
      const url = base + p;
      const cells = [];
      for (const [token, ua] of ROBOTI) {
        let status = 0, ld = { count: 0, valid: 0, types: [] };
        try {
          const res = await fetch(url, { headers: { 'User-Agent': ua }, redirect: 'manual' });
          status = res.status;
          ld = jsonLd(await res.text());
        } catch (e) { status = 'ERR'; }
        const allowed = robotsAllows(robotsTxt, token, p);
        const ok = status === 200 && ld.count === 1 && ld.valid === 1 && allowed;
        if (!ok) bad++;
        cells.push(ok ? '✅' : `❌ ${status}${ld.count !== 1 ? ` ld=${ld.count}` : ''}${allowed ? '' : ' robots'}`);
      }
      rows.push(`| \`${p}\` | ${cells.join(' | ')} |`);
      if (!noValidator) {
        const r = await validate(url);
        if (r.errors || r.fetchError) bad++;
        valRows.push(`| \`${p}\` | ${r.fetchError || 'OK'} | ${r.types.join(', ')} | ${r.errors} | ${r.warnings} |`);
      }
    }
  }
  const llms = await fetch(`${base}/llms.txt`);
  const llmsTxt = llms.status === 200 ? await llms.text() : '';

  const md = [
    `# Dostupnost vrstvy pro AI — ${base}`,
    '',
    `Spuštěno ${new Date().toISOString()}. HTML stažené bez JavaScriptu s User-Agentem daného robota. ✅ = HTTP 200, právě jeden platný blok JSON-LD v surovém HTML a robots.txt stránku robotovi povoluje.`,
    '',
    `| URL | ${ROBOTI.map(r => r[0]).join(' | ')} |`,
    `|---|${ROBOTI.map(() => '---').join('|')}|`,
    ...rows,
    '',
    noValidator ? '_Validátor schema.org vynechán (--bez-validatoru)._' : '## validator.schema.org (URL)\n\n| URL | Načtení | Typy | Chyby | Varování |\n|---|---|---|---|---|\n' + valRows.join('\n'),
    '',
    '## robots.txt',
    '',
    '```',
    robotsTxt.trim(),
    '```',
    '',
    `## /llms.txt\n\nHTTP ${llms.status}${llmsTxt ? `, ${Buffer.byteLength(llmsTxt)} B, první řádek: \`${llmsTxt.split('\n')[0]}\`` : ''}`,
    '',
    `**Výsledek: ${bad ? `${bad} problémů` : 'vše v pořádku'}.**`
  ].join('\n') + '\n';

  if (out) fs.writeFileSync(out, md);
  console.log(md);
  process.exit(bad ? 1 : 0);
})();
