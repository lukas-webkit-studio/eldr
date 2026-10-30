/* Snímky stránek pro kontrolu „vzhled beze změny“ (issue #35).
   node scripts/ai-vrstva/snimky.js <prefix> [base] — uloží docs/snimky/s5-ai-vrstva/<prefix>-<slug>-<viewport>.png */
const path = require('path');
const { chromium } = require('playwright');
const [prefix = 'pred', base = 'https://eldr.webflow.io'] = process.argv.slice(2);
const SLUGS = ['pylony-a-totemy', 'vystrce-lekarenske-znaky'];
(async () => {
  const b = await chromium.launch();
  for (const slug of SLUGS) {
    for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobil', { width: 390, height: 844 }]]) {
      const p = await b.newPage({ viewport: vp });
      await p.goto(`${base}/produkty/${slug}`, { waitUntil: 'networkidle', timeout: 90000 });
      await p.waitForTimeout(1500);
      const out = path.join(__dirname, '..', '..', 'docs', 'snimky', 's5-ai-vrstva', `${prefix}-${slug}-${name}.png`);
      await p.screenshot({ path: out, fullPage: false });
      console.log(out);
      await p.close();
    }
  }
  await b.close();
})();
