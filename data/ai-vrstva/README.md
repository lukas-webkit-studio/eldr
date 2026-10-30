# Vrstva pro AI — data produktových stránek

Strojově čitelný popis 10 produktových stránek eldr.cz v CS, EN a DE
(issue #35). Z těchto souborů se generuje JSON-LD, Google Docs i `llms.txt`.

**Pravidlo:** do vrstvy smí jen to, co je na stránce vidět. Každý údaj má
doslovnou citaci, která se musí najít ve viditelném textu stránky. Hlídá to
`npm run check` (`scripts/ai-vrstva/test-dohledatelnost.js`).

## Soubory

| Soubor | Co v něm je |
|---|---|
| `_zdroj/<slug>.<lang>.txt` | viditelný text stránky, jak ho vidí robot bez JS (snímek z `scripts/ai-vrstva/snapshot.js`) |
| `_zdroj/<slug>.<lang>.outline.json` | totéž po blocích, s kotvou sekce a obrázky |
| `<slug>.<lang>.json` | vytěžené údaje (formát níž) |

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
    "highlights": [Údaj],        // krátké body v hero (např. „Úsporné LED")
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
