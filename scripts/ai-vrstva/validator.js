/* Validátor schema.org (validator.schema.org) pro JSON-LD vrstvy pro AI.
   node scripts/ai-vrstva/validator.js <soubor.jsonld|URL>…  → chyby a varování po souborech
   Kód posílá jako <script type="application/ld+json">, URL nechá stáhnout validátor. */
const fs = require('fs');

async function validate(input) {
  const body = new URLSearchParams();
  if (/^https?:\/\//.test(input)) body.set('url', input);
  else body.set('html', `<script type="application/ld+json">${fs.readFileSync(input, 'utf8')}</script>`);
  const res = await fetch('https://validator.schema.org/validate', { method: 'POST', body });
  const raw = await res.text();
  const d = JSON.parse(raw.replace(/^\)\]\}'\s*/, ''));
  const issues = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      if (o.errorType) issues.push(`${o.isSevere ? 'CHYBA' : 'varování'} ${o.errorType} ${(o.args || []).join(' | ')}`);
      Object.values(o).forEach(walk);
    }
  })(d.tripleGroups || []);
  const types = (d.tripleGroups || []).map(g => g.type);
  return { input, fetchError: d.fetchError, objects: d.numObjects, errors: d.totalNumErrors, warnings: d.totalNumWarnings, types, issues };
}

if (require.main === module) {
  (async () => {
    let bad = 0;
    for (const f of process.argv.slice(2)) {
      const r = await validate(f);
      if (r.errors || r.fetchError) bad++;
      console.log(`${r.errors || r.fetchError ? '❌' : '✅'} ${f}: ${r.objects} objektů [${r.types.join(', ')}], chyb ${r.errors}, varování ${r.warnings}${r.fetchError ? ', ' + r.fetchError : ''}`);
      [...new Set(r.issues)].forEach(i => console.log('     ' + i));
    }
    process.exit(bad ? 1 : 0);
  })();
}
module.exports = { validate };
