/* Test parseru robots.txt v dostupnost.js (RFC 9309). node scripts/overeni/test-robots.js */
const { robotsAllows } = require('./dostupnost');

const ELDR = 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dev/\n\nSitemap: https://www.eldr.cz/sitemap.xml\n';
const CASES = [
  ['eldr: produkt povolen', ELDR, 'GPTBot', '/produkty/pylony-a-totemy', true],
  ['eldr: /dev/ zakázán', ELDR, 'ClaudeBot', '/dev/recenze', false],
  ['skupiny se stejným tokenem se spojí', 'User-agent: GPTBot\nAllow: /\n\nUser-agent: gptbot\nDisallow: /de/\n', 'GPTBot', '/de/x', false],
  ['Crawl-delay mezi User-agent skupinu neukončí', 'User-agent: GPTBot\nCrawl-delay: 5\nUser-agent: *\nDisallow: /\n', 'GPTBot', '/x', false],
  ['vlastní skupina má přednost před *', 'User-agent: *\nDisallow: /\n\nUser-agent: ClaudeBot\nAllow: /\n', 'ClaudeBot', '/x', true],
  ['token s verzí', 'User-agent: Googlebot/2.1\nDisallow: /tajne\n', 'Googlebot', '/tajne/a', false],
  ['nejdelší shoda vyhrává', 'User-agent: *\nDisallow: /produkty/\nAllow: /produkty/pylony\n', 'Bingbot', '/produkty/pylony-a-totemy', true],
  ['zástupný znak a $', 'User-agent: *\nDisallow: /*.pdf$\n', 'Bingbot', '/a/b.pdf', false],
  ['prázdný robots.txt = vše povoleno', '', 'GPTBot', '/x', true]
];
let fail = 0;
for (const [name, txt, token, p, want] of CASES) {
  const got = robotsAllows(txt, token, p);
  if (got !== want) { fail++; console.log(`  ❌ ${name}: ${got}, má být ${want}`); }
}
console.log(`robots.txt: ${CASES.length - fail}/${CASES.length} případů OK`);
process.exit(fail ? 1 : 0);
