# Přestavba produktových stránek — stav a zadání

Živý stav rozpracované série. **Čte se jako první**, když práce pokračuje
v nové session. Postup, mapa framů a technické limity jsou v
`produktove-stranky-figma.md` — tenhle soubor říká, co je hotové a co dál.

## Rozhodnutí zadavatele (3. 9. 2026)

1. **Sekce, které jsou v návrhu, ale nevede na ně odkaz z menu**
   („Atypické zámečnické konstrukce", „Atypické výstrče", „Designové
   obrazy") — **postavit** a **přidat odkaz do menu**. V sekundárních
   locale je odkaz **skrýt**, protože tam obsah zatím neexistuje: na
   odkaz se dá combo třída `localization-show-only_cs` (existuje, přepíná
   ji `src/eldr.css` podle `lang-*` na `<body>`). Každá sekce dostane
   vlastní `id` odvozené ze svého názvu a musí být správně napárovaná na
   galerii v CMS.

2. **Publikuje se jednou, až bude hotová celá série.** Ne po jednotlivých
   stránkách — každý publish pouští ven i cizí rozdělanou práci.

3. **Obrázky se do stránek nevkládají.** Nahrají se do assetů, zatřídí do
   `Produkty/<název stránky>/`, pojmenují podle sekce a dostanou alt text.
   Ve stránce zůstane obrázek zděděný ze vzoru. Důvod je limit popsaný
   v `produktove-stranky-figma.md`: zápis přes API rozbije `sizes`
   a obrázek zešedne. Člověk je v Designeru překlikne podle seznamu níž.

4. **Nejednoznačnosti se neobcházejí.** Zvolí se nejbližší rozumná
   varianta, pokračuje se dál a rozhodnutí se zapíše do „Rozhodnutí
   učiněná za pochodu".

## Stav stránek

| Stránka | Figma | Struktura | Texty | Galerie | Obrázky do assetů |
|---|---|---|---|---|---|
| Orientační systémy | `1921:2203` | hotovo | hotovo | hotovo | hotovo |
| Zámečnické konstrukce | `1926:2736` | | | | |
| Výstrče, lékárenské znaky | `1886:2143` | | | | |
| Velkoformátový tisk | `1929:3364` | | | | |
| Vstupní portály | `1953:2003` | | | | |
| Prvky podpory prodeje | `1958:2631` | | | | |
| Světelné panely a tabule | `1438:6615` | | | | |
| Designová svítidla | `2179:2707` | | | | |

Stránky vznikají v `/dev/<slug>`, vyřazené ze sitemapy, nepublikované.

## Sekce podle návrhu

Ověřeno proti návrhu, ne jen proti menu — návrh má u některých stránek
sekci navíc. Hvězdička = sekce bez odkazu v menu, řeší se podle
rozhodnutí 1.

| Stránka | Sekce (pořadí podle návrhu) |
|---|---|
| Orientační systémy | `orientacni-systemy` |
| Zámečnické konstrukce | `zamecnicke-konstrukce`, `atypicke-zamecnicke-konstrukce`\*, `opracovani-a-prodej-plexiskla` |
| Výstrče | `vystrce`, `atypicke-vystrce`\*, `lekarenske-znaky` |
| Velkoformátový tisk | `uvod`, `rezana-grafika`, `dalsi-druhy-polepu`, `designove-obrazy`\* |
| Vstupní portály | `vstupni-portaly`, `architektonicke-prvky`, `vlajky` |
| Prvky podpory prodeje | `prvky-podpory-prodeje`, `led-displaye`, `led-obrazovky` |
| Světelné panely a tabule | `svetelne-panely`, `intarzie`, `reklamni-tabule`, `menuboardy` |
| Designová svítidla | `designova-svitidla`, `zarovkove-svetelne-napisy`, `neonove-napisy`, `mechove-steny`, `reklama-z-cortenoveho-plechu`, `svetelna-cisla-domu`, `stojaci-lampy` |

U každé stránky se počet sekcí ověřuje ze screenshotu návrhu, ne z počtu
karet v rozcestníku — u Zámečnických se právě takhle našla třetí sekce,
kterou rozcestník nemá.

## Co člověk udělá ráno

Průběžně doplňovaný seznam. Každá položka musí být proveditelná bez
dohledávání — plná cesta k assetu i místo ve stránce.

### Orientační systémy — `/dev/orientacni-systemy`

1. Hero obrázek → vybrat `Produkty / Orientační systémy / hero.webp`
2. Produktová fotka v sekci „Orientační systémy budov a areálů" — jsou
   tam **tři** obrázky přes sebe (varianty cs/en/de) → všem třem vybrat
   `Produkty / Orientační systémy / orientacni-systemy-budov-a-arealu.png`

Důvod: obojí se do stránky dostalo přes API, takže má rozbité `sizes`
a zobrazuje se rozmazaně. Překliknutím v Designeru se to spraví.

## Rozhodnutí učiněná za pochodu

Věci, kde návrh nedával jednoznačnou odpověď a zvolila se varianta, kterou
je vhodné zkontrolovat.

- **Ikony ve dvousloupcovém bloku** (Orientační systémy): návrh ukazuje
  otazník v plném kolečku, ale ten symbol se v souboru nepodařilo najít
  jako samostatný uzel. Použilo se inline SVG ve stylu zbytku sady —
  kolečko v barvě z třídy, otazník bílý.
- **Produktová fotka ve třech jazykových slotech** (Orientační systémy):
  fotka rozcestníku neobsahuje překládaný text, takže do všech tří
  variant šel tentýž soubor.

## Neuzavřené věci pro zadavatele

- **`Disallow: /dev/` do robots.txt** (Site settings → SEO). Dev stránky
  nemají `noindex` a ze sitemapy je vyřazuje jen nastavení u stránky.
  API na robots.txt nesahá.
- **Překlady EN a DE.** Nové stránky je mají prázdné; řeší se až po
  dokončení všech českých verzí. Do té doby se neprohazují slugy.
