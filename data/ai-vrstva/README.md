# Vrstva pro AI — data produktových stránek

Strojově čitelný popis 10 produktových stránek eldr.cz v CS, EN a DE
(issue #35). Z těchto souborů se generuje JSON-LD, Google Docs i `llms.txt`.

**Pravidlo:** do vrstvy smí jen to, co je na stránce vidět a co popisuje výrobek. Tvrzení o firmě, superlativy a marketingové štítky jdou do `vynechano`. Každý údaj má
doslovnou citaci, která se musí najít ve viditelném textu stránky. Hlídá to
`npm run check` (`scripts/ai-vrstva/test-dohledatelnost.js`).

## Soubory

| Soubor | Co v něm je | Vzniká |
|---|---|---|
| `_zdroj/<slug>.<lang>.txt` | viditelný text stránky bez JavaScriptu (snímek) | `scripts/ai-vrstva/snapshot.js` |
| `_zdroj/<slug>.<lang>.outline.json` | totéž po blocích, s kotvou sekce a obrázky | `snapshot.js` |
| `<slug>.<lang>.json` | vytěžené údaje s citacemi (formát níž) | ručně (subagent), kontroluje test |
| `_overeni/<slug>.md` | protokol nezávislého ověření stránky | ověřovatel |
| `jsonld/<slug>.<lang>.jsonld` | JSON-LD, který se zapisuje do Webflow | `scripts/ai-vrstva/jsonld.js` |
| `docs/<slug>.<lang>.html` | podklad pro Google Docs pro klienta | `scripts/ai-vrstva/docs.js` |
| `docs/_souhrn-*.html` | dva souhrnné dokumenty pro klienta | ručně |
| `llms.txt` | souhrnný soubor pro AI do kořene webu | `scripts/ai-vrstva/llms.js` |

## Postup

1. `node scripts/ai-vrstva/snapshot.js` — snímky produkce (Playwright s Chromiem, v cloudu předinstalovaný; jinde `npm i -g playwright`).
2. Údaje do `<slug>.<lang>.json`, kontrola `npm run test:ai`.
3. `node scripts/ai-vrstva/jsonld.js`, `docs.js`, `llms.js`.
4. Zápis `jsonld/` do Webflow (`bulk_update_pages_schema_markup`, EN/DE s `localeId`).
5. Po publikaci `node scripts/overeni/dostupnost.js --out …`.

**Změna textu na webu:** test v `npm run check` porovnává se snímkem, ne s živým webem. Rozdíl ukáže `node scripts/ai-vrstva/test-dohledatelnost.js --live`. Pak nový snímek, oprava údajů a nový zápis.

**Co snímek bere za viditelné:** prvky, které nejsou `display:none` ani `visibility:hidden` při vypnutém JavaScriptu (desktop 1440 i mobil 390). Robot čte i skrytý text, vrstva ale bere jen to, co vidí člověk. Prvky, které Webflow Interactions skrývají přes `opacity:0` až do spuštění animace, snímek počítá jako viditelné, protože je návštěvník s JavaScriptem uvidí.

## Údaj

Každý údaj je objekt `{ "value": "…", "quote": "…" }`.

- `quote` je **doslovná** citace ze snímku stránky (celá věta nebo blok).
- `value` je **souvislý úsek** citace. Nic se nepřepisuje, neskloňuje ani
  nepřekládá. Kde se hodí celá věta, `value` = `quote`.
- Porovnává se po normalizaci: Unicode NFC, všechny druhy mezer a zalomení
  řádků → jedna mezera, typografické uvozovky → rovné, pomlčky → `-`,
  odstraněné neviditelné znaky. Velikost písmen se nemění.

## Soubor stránky

```json
{
  "slug": "pylony-a-totemy",
  "lang": "cs",
  "url": "https://www.eldr.cz/produkty/pylony-a-totemy",
  "page": {
    "name": Údaj,                // H1 stránky
    "description": Údaj,         // perex pod H1
    "highlights": [Údaj],        // krátké body v hero (např. „Úsporné LED"); do JSON-LD nejdou
    "properties": [ { "name": Údaj, "value": Údaj } ]  // údaje platné pro celou stránku
  },
  "products": [
    {
      "key": "pylony",           // kotva sekce, nebo vlastní klíč a-z0-9-
      "anchor": "pylony",        // id prvku na stránce, null když sekce kotvu nemá
      "name": Údaj,
      "description": Údaj,
      "image": { "src": "…", "alt": "…" } | null,   // obrázek ze sekce (outline)
      "properties": [ { "name": Údaj, "value": Údaj } ],  // „Materiál: …", rozměry, montáž…
      "materials": [Údaj],
      "variants":  [Údaj],       // provedení, typy, varianty
      "uses":      [Údaj]        // umístění, použití
    }
  ],
  "faq": [ { "question": Údaj, "answer": Údaj } ],
  "vynechano": [ { "text": "…", "duvod": "…" } ]
}
```

`faq` jen z nadpisů, které jsou na stránce doslova otázkou a hned za nimi
je odpověď. Řečnické otázky v marketingovém textu („Hledáte…?“) se
nepočítají. `vynechano` zapisuje, co se do vrstvy záměrně nedostalo a proč.
