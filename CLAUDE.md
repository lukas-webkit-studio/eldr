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
commit. Po publikaci vždy ověř, co se doopravdy načítá — stáhni si živou
stránku a najdi v ní ten commit.

**Uživatel na custom code sahat nemusí.** Přepnutí i publikace jdou přes
API (`data_scripts_tool > set_site_freeform_code`,
`data_sites_tool > publish_site`) a patří k dokončení práce, ne do seznamu
úkolů pro něj. Ruční cesta přes Designer existuje jen jako záloha — panel
Custom Code má vlastní tlačítko Save Changes, bez něj se publikuje stará
verze.

**Proč se pinuje commit a ne větev.** jsDelivr posílá na `@main` i na
`@<commit>` stejné hlavičky: `s-maxage=43200` (12 h na CDN) a
`max-age=604800` (**7 dní v prohlížeči návštěvníka**). U větve se URL
nemění, takže by vracející se návštěvník měl týden starý bundle a nešlo by
s tím nic dělat. U commitu se URL změní a stáhne se hned. Nenavrhuj přechod
na `@main` ani na plovoucí tag.

Při nasazení už jednou došlo k přepsání celého site head a z produkce
zmizel GTM loader i Finsweet skripty. Vkládej vždy celý blok najednou a po
publikaci zkontroluj, že v head je `GTM-W6PR2VX` a všechny čtyři Finsweet
skripty.

## Když na webu dělá víc chatů najednou

Git si poradí — větve, PR, merge. **Webflow ne.** Nemá zámky, nemá větve
a nemá historii po jednotlivých změnách; kdo zapíše přes API jako druhý,
přepíše prvního bez varování. Odtud tahle čtyři pravidla.

### Pinovat jen merge commity z mainu

Do custom code patří **merge commit z `main`**, nikdy commit z větve. Commit
z větve neobsahuje to, co mezitím mergnuli ostatní. Takhle se už jednou
vrátil na produkci override tlačítek, který PR #3 záměrně přesunul do
Webflow — větev stavěla na commitu, o který `origin/main` mezitím povyrostl.

Postup: `git fetch origin main`, `git merge origin/main` do své větve,
`npm run check`, merge PR, a **teprve merge commit** dej do Webflow.

### Head a footer číst, ne psát z hlavy

Vždycky nejdřív `data_scripts_tool > get_site_freeform_code`, v načteném
textu vyměň **jen hash** a pošli zpátky **celý obsah pole**. Nikdy neskládej
obsah z paměti ani ze zálohy v repu — přesně takhle 15. 8. zmizel
z produkce GTM loader a Finsweet skripty (viz `_backup/FINDINGS.md`).
Po zápisu zálohu v `_backup/webflow/custom-code/` srovnej s realitou.

### Publikace pouští ven i cizí rozdělanou práci

Webflow publikuje **celý web**, ne jen tvoje změny. Když má jiný chat nebo
člověk v Designeru něco rozdělaného, tvůj publish to pošle ven s sebou.

Před publikací si vytáhni `data_sites_tool > get_site`: když je
`lastUpdated` výrazně novější než `lastPublished`, někdo něco rozdělaného
má. Pak se zeptej, nepublikuj naslepo. **„Kdy publikovat" je rozhodnutí
uživatele**, ne tvoje — je to jediný krok nasazení, který za něj nejde
udělat bezpečně.

### dist/ se sráží

`dist/` se commituje, takže **každá větev, co sáhne na `src/`, vyrobí
konflikt v `dist/`**. Neřeš ho ručně: po mergi `main` do větve spusť
`npm run build` a commitni přegenerovaný výstup.

## Překlady do DE a EN

Web běží na nativní Webflow lokalizaci: čeština je primární locale,
`/en` a `/de` sekundární. Do primárního locale se přes API zapsat nedá
a ani se nemá.

Terminologie i postup jsou ve skillu `.claude/skills/preklad/` — glosář
CZ→EN→DE, které API píše kam (CMS položky, statické stránky, komponenty
a SEO metadata mají každé jiný nástroj) a jak se výsledek ověřuje.
Zdrojové dokumenty původních překladů jsou v `docs/translation/`; jsou
zastaralé, ground truth je živý web.

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
