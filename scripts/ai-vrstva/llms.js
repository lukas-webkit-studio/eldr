/* Generátor /llms.txt (formát llmstxt.org) z dat vrstvy pro AI (issue #35).

   Všechny texty jsou převzaté z webu: názvy a popisy z data/ai-vrstva/*.json,
   firemní údaje doslovně z patičky produktových stránek (CITACE níž — test
   dohledatelnosti je ověřuje proti snímku). Nadpisy sekcí jsou jen navigace.

   node scripts/ai-vrstva/llms.js → data/ai-vrstva/llms.txt */
const fs = require('fs');
const path = require('path');
const { STRANKY, BASE } = require('./stranky');
const { load } = require('./jsonld');

/* Doslovné citace z patičky a bloku o firmě (snímek pylony-a-totemy.<lang>.txt). */
const CITACE = {
  firma: 'ELEKTRO DRAPAČ s.r.o. Žďárecká 177, Velké Poříčí',
  praha: 'Kancelář Praha Gutova 3317/15, Praha 10 - Strašnice',
  schuzka: 'Schůzka v kanceláři s obchodním zástupcem pouze dle telefonické domluvy',
  hodiny: 'Po - Pá 6:00 - 15:00',
  telefon: '+420 491 482 500',
  email: 'eldr@eldr.cz',
  vyroba: 'Výroba naší světelné reklamy probíhá kompletně v Česku.',
  montaz: 'Poskytujeme profesionální instalaci a servis.',
  navrh: 'Světelnou reklamu navrhneme na míru podle firemní identity.'
};

function build() {
  const out = [];
  out.push('# ELEKTRO DRAPAČ s.r.o. (ELDR)', '');
  out.push(`> ${CITACE.vyroba} ${CITACE.navrh} ${CITACE.montaz}`, '');
  out.push('Web je ve třech jazycích: čeština (hlavní), angličtina (/en) a němčina (/de).');
  out.push('Každá produktová stránka má strukturovaná data JSON-LD; všechny údaje v nich jsou převzaté z textu stránky.', '');

  out.push('## Kontakt', '');
  out.push(`- ${CITACE.firma}`);
  out.push(`- ${CITACE.praha}. ${CITACE.schuzka}.`);
  out.push(`- Telefon: ${CITACE.telefon} (${CITACE.hodiny})`);
  out.push(`- E-mail: ${CITACE.email}`);
  out.push(`- [Kontakty](${BASE}/kontakty)`, '');

  out.push('## Produkty', '');
  for (const { slug } of STRANKY) {
    const cs = load(slug, 'cs');
    const names = cs.products.map(p => p.name.value).join(', ');
    const desc = cs.page.description ? ` ${cs.page.description.value}` : '';
    out.push(`- [${cs.page.name.value}](${cs.url}): ${names}.${desc}`);
  }
  out.push('');

  for (const lang of ['en', 'de']) {
    out.push(lang === 'en' ? '## Products (English)' : '## Produkte (Deutsch)', '');
    for (const { slug } of STRANKY) {
      const d = load(slug, lang);
      out.push(`- [${d.page.name.value}](${d.url}): ${d.products.map(p => p.name.value).join(', ')}.`);
    }
    out.push('');
  }

  out.push('## Optional', '');
  out.push(`- [O nás](${BASE}/o-nas)`);
  out.push(`- [Reference](${BASE}/reference)`);
  out.push(`- [Servisní služby a pronájem plošin](${BASE}/servisni-sluzby-a-pronajem-plosin)`);
  out.push(`- [Inspirace](${BASE}/inspirace)`);
  return out.join('\n') + '\n';
}

if (require.main === module) {
  const file = path.join(__dirname, '..', '..', 'data', 'ai-vrstva', 'llms.txt');
  const txt = build();
  fs.writeFileSync(file, txt);
  console.log(`llms.txt: ${Buffer.byteLength(txt)} B, ${txt.split('\n').length} řádků → ${path.relative(process.cwd(), file)}`);
}

module.exports = { build, CITACE };
