# ELDR — pokyny pro práci na tomhle projektu

## Nejdůležitější pravidlo: nejdřív Webflow, teprve pak kód

Web se spravuje ve Webflow. Tenhle repozitář je doplněk, ne náhrada.

**Než cokoliv napíšeš do `src/eldr.css` nebo `src/modules/`, ověř, jestli to
nejde nastavit přímo ve Webflow.** Neptej se sám sebe „umím to napsat v CSS" —
ptej se „umí to Webflow". Ověřuj to nástrojem, ne odhadem. Webflow MCP toho
umí víc, než se na první pohled zdá:

| Nástroj | Co umí |
|---|---|
| `data_style_tool` | číst i **zapisovat** styly na třídách, včetně pseudo-stavů `hover`, `active`, `focus`, `before`, `after`, po breakpointech a na kombo třídách |
| `data_variable_tool` | číst i zakládat proměnné (barvy, velikosti, fonty) |
| `data_element_tool`, `data_element_builder` | číst i měnit strukturu prvků na stránce |
| `data_pages_tool` | nastavení stránek, SEO, JSON-LD |
| `data_sites_tool` | detail webu a **publikace** |

### Co patří do Webflow

Vzhled. Barvy, rozměry, odsazení, stíny, zaoblení, přechody, hover a active
stavy, breakpointy. Když to jde nastavit na třídě v Designeru, patří to do
Designeru — i když by to v CSS byl jeden řádek.

Override v custom kódu je horší ze dvou důvodů: pere se s tím, co je
nastavené na třídě, a kdo pak na tu třídu ve Webflow sáhne, nevidí důvod,
proč se prvek chová jinak, než jak ho nastavil.

### Co patří do repozitáře

- **Chování závislé na JS** — počítadlo, zámek scrollu, detekce jazyka,
  měření do GTM, ovládání slideru, popupy.
- **Selektory, které Webflow ve style panelu neumí zapsat** — vztahy
  rodič→potomek (`.karta:hover .ikona`), pseudo-elementy bez vlastní
  podpory, `@media (prefers-reduced-motion)`.
- **Failsafe** — když má něco fungovat i při výpadku JS.

Když do custom kódu něco přidáváš, napiš do komentáře **proč to nešlo ve
Webflow**. Pokud to zdůvodnit nedokážeš, patří to do Webflow.

### Čeho se API nedotkne

**Interakce (IX2) API neumí číst ani zapisovat.** Vstupní animace, hover
animace na jiný prvek, scroll efekty — to se musí naklikat v Designeru.
Nesnaž se to obejít custom kódem bez domluvy: kdyby to uživatel později
přidal i ve Webflow, obojí by se pralo.

## Nasazení

Bundle se servíruje z jsDelivr, připnutý na konkrétní commit:

```
https://cdn.jsdelivr.net/gh/lukas-webkit-studio/eldr@<commit>/dist/eldr.min.css
https://cdn.jsdelivr.net/gh/lukas-webkit-studio/eldr@<commit>/dist/eldr.min.js
```

CSS je v **Site settings → Custom Code → Head**, JS ve **Footer**.
`.min.` soubory v repu nejsou — jsDelivr minifikuje sám.

Změna v repu se na web nedostane, dokud se v Custom Code nepřepne připnutý
commit. Panel Custom Code má **vlastní tlačítko Save Changes**; bez něj se
publikuje pořád stará verze. Po publikaci vždy ověř, co se doopravdy
načítá — stáhni si živou stránku a najdi v ní ten commit.

Při nasazení už jednou došlo k přepsání celého site head a z produkce
zmizel GTM loader i Finsweet skripty. Vkládej vždy celý blok najednou a po
publikaci zkontroluj, že v head je `GTM-W6PR2VX` a všechny čtyři Finsweet
skripty.

## Práce s repozitářem

```
npm run build    # src/ → dist/
npm run test     # smoke test na jsdom
npm run lint
npm run check    # všechno dohromady
```

`dist/` se commituje — jsDelivr servíruje přímo z repa.

### Struktura

- `src/modules/` — číslované moduly, `build.js` je slévá do jednoho IIFE.
  Sdílené pomocné funkce jsou v `00-core.js` (`SEL`, `$$`, `$1`, `onReady`,
  `has`, `hasJQ`, `locale`). Nové globály přidej i do `eslint.config.js`.
- Každý modul se **sám vypne**, když na stránce není jeho prvek.
- **Migrační režim (expand):** selektory cílí na starý i nový název třídy,
  aby web fungoval během přejmenovávání na client-first. Staré názvy se
  odstraní až po dokončení migrace.

### Ověřování

Netvrď nic o webu, cos neověřil. Publikované stránky jsou v
`_backup/published/sitemap-urls.txt` — dá se přes ně projet skutečné HTML
a zjistit, jestli daný selektor vůbec někde je. Tímhle způsobem se našlo,
že detekce jazyka podle podřetězce v URL rozbíjela dvě stránky z 87 a že
`lazy` konfigurace Swiperu byla mrtvá.

Zálohy v `_backup/webflow/custom-code/` bývají zastaralé. Ground truth je
živý web, ne ony.

## Měření

Hook třídy pro GTM (container `GTM-W6PR2VX`) jsou v `SEL` označené
komentářem. Ve Webflow zůstávají na prvcích jako prázdné třídy bez CSS —
**nemazat bez auditu containeru**.

Konverzi `contact_form_submit` odpaluje samostatný skript navázaný na
`#form-kontakt`. Bundle formulář **záměrně neměří**, jinak by se konverze
počítala dvakrát. Smoke test to hlídá.
