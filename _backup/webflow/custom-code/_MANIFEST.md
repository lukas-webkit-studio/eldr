# Záloha custom kódu — Webflow ELDR
Site ID: 635940ec249b210e8902edd4 · Workspace: 63593aa9923e4a3417813ca5
Pořízeno: 2026-08-27 · Stav webu: publikováno 2026-08-27, bundle připnutý
na commit `0b12f9b` (head i footer).

⚠️ Záloha stárne rychle. Než sáhneš na site head/footer, **vždycky si
vytáhni aktuální stav** přes `data_scripts_tool > get_site_freeform_code`
a tenhle soubor přepiš — 27. 8. tvrdila, že live jede na `v1.2.27`,
zatímco už dávno běžel sloučený bundle. A při zápisu posílej **celý obsah
pole**, nikdy „jen tenhle blok" (incident 2026-08-15, viz FINDINGS.md).

| Soubor | Umístění ve Webflow |
|---|---|
| site-head.html | Site settings → Custom code → Head |
| site-footer.html | Site settings → Custom code → Footer |
| page-domovska-head.html | Domovská stránka → Page settings → Head |
| page-domovska-footer.html | Domovská stránka → Page settings → Footer |
| page-reference-footer.html | Reference → Footer |
| page-o-nas-footer.html | O nás → Footer |
| page-kontakty-head.html | Kontakty → Head |
| page-kontakty-footer.html | Kontakty → Footer |
| page-3d-napisy-head.html | Produkty/3D nápisy → Head |
| page-pylony-head.html | Produkty/Pylony a totemy → Head |

Stránky s prázdným custom kódem: Styleguide, Muzeum, Produkty, Inspirace.

## Zastaralé kopie (přesunuto z rootu repa)
- `_stale-head-v1.2.3.html` — odkazovala na tag v1.2.3, neobsahovala Finsweet. Live je v1.2.27.
- `_stale-footer.html` — zdroj chyby `.Form__Type1` (správně `.form__type1`).
Aktuální pravdivý stav je v `site-head.html` a `site-footer.html`.
