/* Snímek viditelného textu produktových stránek — zdroj pravdy pro vrstvu pro AI.

   Proč takhle: údaj smí do strukturovaných dat, jen když ho na stránce vidí
   člověk i robot. Proto se stránka renderuje BEZ JavaScriptu (AI roboti JS
   nespouštějí) a bere se jen text prvků, které nejsou skryté přes CSS
   (`display:none`, `visibility:hidden`). Výjimka: neaktivní záložky
   Webflow (`.w-tab-pane`) — návštěvník je otevře kliknutím. Text se bere
   z desktopu (1440) i mobilu (390) a sjednotí se.

   Výstup:
     data/ai-vrstva/_zdroj/<slug>.<lang>.txt          viditelný text, blok = řádek
     data/ai-vrstva/_zdroj/<slug>.<lang>.outline.json bloky v pořadí, s kotvou a obrázky

   Spuštění: node scripts/ai-vrstva/snapshot.js [--base https://eldr.webflow.io] [--out dir] [slug…]
*/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { STRANKY, LOCALES, urlFor, BASE } = require('./stranky');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const base = opt('--base', BASE);
const outDir = opt('--out', path.join(__dirname, '..', '..', 'data', 'ai-vrstva', '_zdroj'));
const only = args.filter(a => !a.startsWith('--'));

/* Běží v prohlížeči. Vrací bloky viditelného textu v pořadí dokumentu. */
function collect() {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'TEMPLATE', 'IFRAME', 'HEAD']);
  const BLOCK = /^(P|H[1-6]|LI|DT|DD|TD|TH|BLOCKQUOTE|FIGCAPTION|LABEL|BUTTON|A|DIV|SECTION|ARTICLE|HEADER|FOOTER|NAV|MAIN|UL|OL|FORM|SPAN|STRONG|EM|B|I)$/;
  const hidden = el => {
    if (el.classList && el.classList.contains('w-tab-pane')) return false;
    const cs = getComputedStyle(el);
    return cs.display === 'none' || cs.visibility === 'hidden';
  };
  const blocks = [];
  const anchorOf = el => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      if (e.id && /^[a-z][a-z0-9-]*$/.test(e.id) && !/^w-node|^pop-up$/.test(e.id)) return e.id;
    }
    return null;
  };
  // Kotva = nejbližší předchozí nebo obalující prvek s id (sekce na stránce).
  let lastAnchor = null;
  function walk(node) {
    if (node.nodeType === 1) {
      if (SKIP.has(node.tagName.toUpperCase()) || hidden(node)) return;
      if (node.id && /^[a-z][a-z0-9-]*$/.test(node.id) && !/^w-node|^pop-up$/.test(node.id)) lastAnchor = node.id;
      if (node.tagName === 'IMG') {
        const src = node.currentSrc || node.getAttribute('src') || '';
        blocks.push({ type: 'img', src, alt: node.getAttribute('alt') || '', anchor: anchorOf(node) || lastAnchor });
        return;
      }
      const isLeafBlock = /^(P|H[1-6]|LI|DT|DD|TD|TH|BLOCKQUOTE|FIGCAPTION|LABEL|BUTTON)$/.test(node.tagName) ||
        (BLOCK.test(node.tagName) && ![...node.children].some(c => /^(P|H[1-6]|LI|DIV|SECTION|UL|OL|IMG|A|TABLE|FIGURE)$/.test(c.tagName)));
      if (isLeafBlock && !node.querySelector('img')) {
        const text = textOf(node);
        if (text) blocks.push({ type: node.tagName.toLowerCase(), text, anchor: anchorOf(node) || lastAnchor });
        return;
      }
      for (const c of node.childNodes) walk(c);
    } else if (node.nodeType === 3) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (t) blocks.push({ type: 'text', text: t, anchor: anchorOf(node.parentElement) || lastAnchor });
    }
  }
  function textOf(el) {
    let out = '';
    (function rec(n) {
      if (n.nodeType === 3) { out += n.textContent; return; }
      if (n.nodeType !== 1 || SKIP.has(n.tagName.toUpperCase()) || hidden(n)) return;
      if (n.tagName === 'BR') { out += ' '; return; }
      for (const c of n.childNodes) rec(c);
    })(el);
    return out.replace(/\s+/g, ' ').trim();
  }
  walk(document.body);
  return { lang: document.documentElement.lang, title: document.title, blocks };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const report = [];
  for (const { slug } of STRANKY) {
    if (only.length && !only.includes(slug)) continue;
    for (const lang of Object.keys(LOCALES)) {
      const url = urlFor(slug, lang, base);
      // Desktop se bere celý (i opakované štítky). Z mobilu jen bloky, které
      // na desktopu nejsou — jinak by se text zdvojil.
      const merged = [];
      let desktopKeys = null;
      let meta = null;
      for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
        const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: vp });
        const page = await ctx.newPage();
        const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        if (!res || res.status() !== 200) throw new Error(`${url} → HTTP ${res && res.status()}`);
        const r = await page.evaluate(collect);
        meta = meta || r;
        const key = b => (b.type === 'img' ? 'img|' + b.src : 'txt|' + b.text);
        if (!desktopKeys) {
          desktopKeys = new Set(r.blocks.map(key));
          merged.push(...r.blocks);
        } else {
          const added = new Set();
          for (const b of r.blocks) {
            const k = key(b);
            if (desktopKeys.has(k) || added.has(k)) continue;
            added.add(k);
            merged.push(b);
          }
        }
        await ctx.close();
      }
      const text = merged.filter(b => b.type !== 'img').map(b => b.text).join('\n');
      fs.writeFileSync(path.join(outDir, `${slug}.${lang}.txt`), text + '\n');
      fs.writeFileSync(path.join(outDir, `${slug}.${lang}.outline.json`),
        JSON.stringify({ url, htmlLang: meta.lang, title: meta.title, blocks: merged }, null, 1) + '\n');
      report.push(`${slug}.${lang}: ${merged.length} bloků, ${text.length} znaků`);
    }
  }
  await browser.close();
  console.log(report.join('\n'));
}

main().catch(e => { console.error(e); process.exit(1); });
