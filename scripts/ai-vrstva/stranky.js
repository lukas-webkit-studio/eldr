/* Seznam produktových stránek, kterých se týká vrstva pro AI (issue #35).
   Page ID a locale ID jsou z Webflow (site 635940ec249b210e8902edd4). */
const SITE_ID = '635940ec249b210e8902edd4';
const LOCALES = {
  cs: { id: null, prefix: '' },
  en: { id: '66052b1245cd8094542338a5', prefix: '/en' },
  de: { id: '66052b1245cd8094542338a6', prefix: '/de' }
};
const STRANKY = [
  { slug: 'pylony-a-totemy', pageId: '64022ba739ac3bd5ed6820d4' },
  { slug: '3d-napisy-loga-a-jednotliva-pismena', pageId: '67cd93a208e0807c31816af3' },
  { slug: 'orientacni-systemy', pageId: '6a99120f6934e22ce69ad69d' },
  { slug: 'zamecnicke-konstrukce-na-miru-opracovani-plexiskla', pageId: '6a9aa29d3f076848d52e7d63' },
  { slug: 'vystrce-lekarenske-znaky', pageId: '6a9aa82d1bc055833d458566' },
  { slug: 'velkoformatovy-tisk', pageId: '6a9aada633cfcc4604230b5f' },
  { slug: 'architektonicke-prvky-vstupni-portaly-vlajky', pageId: '6a9ab01047299df13695660e' },
  { slug: 'prvky-podpory-prodeje-led-technologie', pageId: '6a9ab0f0fdf55c29d79dc962' },
  { slug: 'tabule-a-svetelne-panely', pageId: '6a9ab1e40aec35eaf9d1edec' },
  { slug: 'designova-a-interierova-svitidla-specialni-projekty', pageId: '6a9ab353346c1fa008c113d7' }
];
const BASE = 'https://www.eldr.cz';
const urlFor = (slug, lang, base = BASE) => `${base}${LOCALES[lang].prefix}/produkty/${slug}`;

module.exports = { SITE_ID, LOCALES, STRANKY, BASE, urlFor };
