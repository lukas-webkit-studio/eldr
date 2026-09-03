# Produktové stránky: Figma → Webflow

Mapa pro přestavbu produktových stránek podle Figma návrhu. Zjištěno
čtením Figma API a živého webu, ne odhadem.

## Zdroje

- **Figma:** `TYIPfNxhM7scK7QG6OCGGs` („ELDR Pracovný"), sekce `1676:3011`
  („Produkty"). Framy uvnitř nejsou pojmenované — párování níž.
- **Webflow site:** `635940ec249b210e8902edd4` (ELDR)
- **Kotvy sekcí:** ground truth je menu na živém webu, ne Figma. Vytáhne se:

  ```
  curl -s https://www.eldr.cz/produkty/3d-napisy-loga-a-jednotliva-pismena \
    | grep -oE 'href="/produkty/[^"]*#[^"]*"' | sed 's/href="//; s/"$//' | awk '!seen[$0]++'
  ```

## Kostra produktové stránky

Ověřeno na obou hotových stránkách (3D nápisy, Pylony a totemy):

```
page-wrapper
├─ Cookies Consent, GTM, Global Styles, Navbar_2024-12   (komponenty)
├─ main-wrapper
│  ├─ header.section_header_product.text-color-white      hero
│  ├─ section.section_layout400                           karty = rozcestník na sekce
│  ├─ (section.section_cards.hide)                        MRTVÁ, nekopírovat
│  ├─ (section.section_layout253)                         nadpis + dva textové sloupce
│  ├─ N× section.section_product  #<id z menu>            produkt + galerie
│  ├─ (section.section_showreel)
│  ├─ section.section_layout121-2 #jak-probiha-vyroba     Jak probíhá výroba
│  ├─ 3× section.section_process-link                     kroky procesu
│  ├─ section.section_layout188 #duvera                   Důvěřují nám
│  └─ layout298_component                                 Záruka prvotřídní kvality
└─ Footer_2024-12
```

Ověřeno na živém HTML obou hotových stránek, ne odhadem z Designeru.

**`section_layout400` je ten rozcestník** — blok „Podívejte se blíže na to,
co vás zajímá / Prozkoumejte pestrou škálu profilů" a jeho karty odpovídají
1:1 kotvám v menu. Nezaměňovat se `section_cards`, což je starší skrytý
duplikát téhož obsahu; ten na nové stránky nepatří.

Stránka s jedinou produktovou sekcí `section_layout400` nemá — rozcestník
na jednu položku nedává smysl (viz Orientační systémy).

Komponenta „Záruka prvotřídní kvality" má prop **Viditelnost CTA**. Na 3D
nápisech i pylonech je `false`, v návrhu Orientačních systémů je CTA pruh
vidět — tam patří `true`.

## Párování framů

| Figma node | Stránka | Webflow pageId | Karet | Kotev | Stav |
|---|---|---|---|---|---|
| `1676:3577` | 3D nápisy, loga a jednotlivá písmena | `67cd93a208e0807c31816af3` | — | 6 | hotovo (vzor) |
| `1676:2328` | Reklamní pylony a totemy | `64022ba739ac3bd5ed6820d4` | 2 | 2 | hotovo (vzor) |
| `1921:2203` | Orientační systémy | `6401fcf4e07002bda0fea1d5` | 0 | 0 | **hotovo**, publikováno na `/dev/orientacni-systemy` |
| `1886:2143` | Výstrče, lékárenské znaky | `64634aa422af13a00b2303c6` | 3 | 2 | neshoda |
| `1926:2736` | Zámečnické konstrukce, plexisklo | `640e42ac69533920507f0278` | 2 | 2 | |
| `1929:3364` | Velkoformátový tisk | `640e43b5aa58d3423e64cb87` | 4 | 3 | neshoda |
| `1953:2003` | Vstupní portály a architektonické prvky | `640220c81cee12c964d37bdc` | 3 | 3 | |
| `1958:2631` | Prvky podpory prodeje | `6402284b510487502b852799` | 3 | 3 | |
| `1438:6615` | Světelné panely a tabule | `6401fe511792a68d1d2aee58` | 4 | 4 | |
| `2179:2707` | Designová a interiérová svítidla | `6402252f78f3f12a5bb17234` | 7 | 7 | největší |
| `2112:2583` | — prázdný frame, jen podklad | — | — | — | ignorovat |

Frame `1078:1354` (320 × 10917) je mobilní verze, ne samostatná stránka.

## Kotvy podle stránek

Pořadí je pořadí v menu, ne abecední.

| Stránka | id sekcí |
|---|---|
| 3D nápisy | `profil-1`, `profil-9`, `profil-4`, `profil-5s`, `profil-8`, `profil-3` |
| Světelné panely a tabule | `svetelne-panely`, `intarzie`, `reklamni-tabule`, `menuboardy` |
| Pylony a totemy | `pylony`, `totemy` |
| Výstrče | `vystrce`, `lekarenske-znaky` (+ chybí *Atypické výstrče*) |
| Zámečnické konstrukce | `zamecnicke-konstrukce`, `opracovani-a-prodej-plexiskla` |
| Velkoformátový tisk | `uvod`, `rezana-grafika`, `dalsi-druhy-polepu` (+ chybí *Designové obrazy*) |
| Vstupní portály | `vstupni-portaly`, `architektonicke-prvky`, `vlajky` |
| Designová svítidla | `designova-svitidla`, `zarovkove-svetelne-napisy`, `neonove-napisy`, `mechove-steny`, `reklama-z-cortenoveho-plechu`, `svetelna-cisla-domu`, `stojaci-lampy` |
| Prvky podpory prodeje | `prvky-podpory-prodeje`, `led-displaye`, `led-obrazovky` |
| Orientační systémy | žádné — stránka má jednu produktovou sekci |

## Otevřené věci

1. **Návrh má víc sekcí než menu.** Výstrče mají v návrhu *Atypické
   výstrče*, velkoformátový tisk *Designové obrazy*. Nové sekce dostanou
   id `atypicke-vystrce` a `designove-obrazy`. Doplnění odkazů do menu je
   zásah do komponenty `Navbar_2024-12`, tedy do všech stránek naráz —
   řešit až budou stránky hotové, samostatně.

2. **Duplicitní DOM id na pylonech.** `section_product#totemy` i
   `section_showreel#totemy` mají stejné id. Nevalidní HTML, kotva
   `#totemy` skočí jen na první. Nekopírovat dál.

3. **`section_layout121 2` je duplikát třídy** (mezera a číslo v názvu,
   v CSS `section_layout121-2`). Renderují ji obě hotové stránky stejně,
   ale na 3D nápisech je zabalená v komponentě „Jak probíhá výroba
   světelné reklamy?", kdežto na pylonech je to lokální kopie. Pro údržbu
   je lepší komponenta — na nových stránkách použít ji.

4. **Web běží ve třech jazycích a překlady jsou vyplněné.** Locales:
   `cs` primární (`66052b1245cd8094542338a7`), `en`
   (`66052b1245cd8094542338a5`), `de` (`66052b1245cd8094542338a6`).
   Ověřeno na živém webu — `/en/produkty/orientacni-systemy` má vlastní
   title i H1 („Orientation systems"), není to fallback na češtinu.

   Nová stránka vzniklá duplikací má **prázdné EN a DE**. Překlady jdou
   dopsat přes `data_localization_tool > update_static_content` (píše jen
   do sekundárních locale, primární je read-only), ale texty se musí
   nejdřív vytáhnout ze staré stránky přes `get_page_content` s
   `localeId`. U textů, které návrh mění, překlad neexistuje a musí
   vzniknout nový — to platí bez ohledu na zvolený postup.

## Postup přestavby jedné stránky

1. `create_page` s `duplicateOf` vzorové stránky → dostane se client-first
   struktura i Relume bloky bez zakládání nových tříd.
2. Naplnit obsahem podle Figma framu, sekcí po sekci.
3. Galerie se nepředělávají — jen se zařadí pod správnou `section_product`.
4. Ověřit na preview.
5. Rozpracovaná stránka žije v **`/dev/`** — složka `672a93ee45bdc8fc69626c95`,
   výsledná adresa `eldr.cz/dev/<slug>`. **Není to draft.** Draft je jen pro
   to, co nikdo nechce; rozdělaná práce se naopak publikuje, aby šla
   prohlédnout, ale **bez indexování**.
6. Prohodit slugy až nakonec: stará stránka `…-old`, nová na ostrý slug.
   URL i SEO zůstanou, stará verze slouží jako záloha. Stejně jako
   `(old) 3D nápisy, loga a jednotlivá písmena`.
7. Publikace až po odsouhlasení — publish pouští ven i cizí rozdělanou
   práci, viz CLAUDE.md.

### Bez indexování

`data_sitemap_tool > update_page_sitemap_status` s `includeInSitemap:
false` vyřadí stránku ze sitemap.xml. To je vše, co API umí.

**Samotné `/dev/` chráněné není.** robots.txt zakazuje jen `/admin/`
a dev stránky nemají `noindex` — dosud je chránilo jen to, že byly draft.
Jakmile se publikují, jsou indexovatelné. Systémové řešení je přidat
`Disallow: /dev/` do robots.txt (Site settings → SEO); API na robots.txt
nesahá, musí se to naklikat.

**Do doplnění překladů se neprohazují slugy.** Rozhodnutím z 3. 9. se
překlady řeší až po dokončení všech českých verzí; do té doby by ostrá
adresa poslala na `/en/` a `/de/` prázdné stránky. V `/dev/` to nevadí.

## Galerie: filtr jde přepnout přes API

Galerie **není** collection list typu `CMSCollection` — hledat ho tak nic
nenajde. Jsou to dva elementy typu `DynamoWrapper`:

| Styl | Co to je |
|---|---|
| `swiper ImageSlider__Collection` | hlavní pás náhledů |
| `swiper-popup PopUpSlider__Collection` | galerie po rozkliknutí |

Oba mají vlastní filtr a **oba se musí přepnout**, jinak náhledy ukazují
jeden produkt a popup jiný.

Filtr se čte `data_element_settings_tool > get_settings` s
`type: "query_settings"` a prázdným dotazem — pod `value_type: "filter"` ho
nenajdeš, vrací se jako `collectionListSetting` pod klíčem `filters`.
Zapisuje se `set_settings` s klíčem `filters` a `static_json`:

```json
[{"fieldSlug":"produkt-2","operator":"equals","value":"<id možnosti>"}]
```

Kolekce je Fotografie `646d5c52aab44e9fcf5974b8`, pole `produkt-2`
(Fotogalerie). ID možností vrátí `data_cms_tool > get_collection_details`.
Řazení (`poradi` sestupně) a limit 30 se nechávají být.

Takže „galerie nechat jak jsou" znamená jen přepnout tenhle jeden filtr —
nic se nepředělává.

## Galerie: designér fotky neořezával

Ověřeno porovnáním otisků obrázků z návrhu proti všem fotkám galerie.
Čtyři fotky, které návrh staví dopředu, jsou **bajt po bajtu tytéž
soubory**, co už v kolekci jsou — stejné rozměry, vzdálenost otisku 0.
Designér je jen dal na jiné pozice.

Co vypadá jako jiný ořez, dělá slider sám: náhledy mají pevný poměr
a `object-fit` ořízne každou fotku podle jejího tvaru. V návrhu má
designér rámečky jednoho poměru, takže výsledek vypadá jinak.

**Přeuspořádání je proto jedno volání** `update_collection_items` s novými
hodnotami `poradi` — žádné stahování, ořezávání ani nahrávání. Stačí dát
vybraným fotkám hodnotu nad dosavadní maximum (u Orientačních systémů
2100/2080/2060/2040 nad původní 2000).

Jak najít, které fotky designér vybral, bez ručního porovnávání:

1. `download_assets` na produktovou sekci vrátí zdrojové bitmapy z návrhu.
2. URL všech fotek galerie se vytáhnou z živé stránky (`src` v HTML),
   ne přes API — je to levnější a pořadí odpovídá řazení podle `poradi`.
3. Spárovat perceptuálním otiskem (16×16 průměrový hash, vzdálenost ≤ 8).
   Pozice v seznamu → `poradi` → ID položky.

Jediný obrázek, který designér **opravdu** ořízl, byla produktová fotka
v pravém sloupci (1440×2560 → 1406×1406) — ta se bere z návrhu, ne z
galerie.

## Obrázky z Figmy: pozor na náhledy

`download_assets` vrací zdrojové bitmapy, ale v návrhu jsou **od každého
motivu dvě verze — originál a zmenšený náhled**. U Orientačních systémů to
bylo 2288×1712 vedle 286×214 téhož obrázku. Brát je podle pořadí znamená
poslat na web náhled. Vždy změřit rozměry a vzít větší z dvojice.

Než se něco nahrává, stojí za to zkontrolovat, jestli fotka na webu už
není: hero obrázek Orientačních systémů byl v assetech
(`68b4a6efa70ab6fafae027c7`) v produkční kvalitě a stačilo ho přiřadit.

Produktový obrázek má **tři jazykové sloty** — combo třídy
`localization-show-only_cs` / `_en` / `_de`, přepínané naším CSS v
`src/eldr.css` podle třídy `lang-*` na `<body>` (modul `20-locale.js`).
U grafiky s textem tam patří tři různé soubory. U reálné fotky bez textu
se do všech tří dá tentýž asset — jinak by EN a DE verze zůstaly
u obrázku předchozího produktu.

## Vzhled: co se dědí špatně

Chyby, které vznikly duplikací vzoru a našly se až vizuálním porovnáním
s návrhem. U dalších stránek zkontrolovat rovnou:

| Co | Projev | Oprava |
|---|---|---|
| výřez hero fotky | ukazuje jinou část snímku než návrh | combo třída `image-focus-*` na `header_product_background-image`; existují `-top` (50% 3%), `-pylon` (100% 0%), `-ppp` (50% 20%), `-vystrce` (50% 50%) |
| produktová fotka bez šikmé hrany | obdélník místo zkoseného rámečku | combo `clipped` na `product_image-wrapper` — nese `clip-path` |
| zděděná combo třída podle jiné stránky | `product_image._3d-napisy` — prázdná, jen mate | odstranit ze `style_names` |
| první štítek bez ikony | ve vzoru ji nemá, návrh ano | doplnit `DivBlock.header_product_metatag-icon` > `HtmlEmbed.icon-embed-xsmall` před textový blok |
| ikony v `section_layout253` | zděděné z 3D nápisů (štětec, štít) | přepsat `code` v `HtmlEmbed`; ikony jsou inline SVG s `currentColor` |

## Co API u textů umí

`set_text` funguje i na `String` uzly uvnitř `Strong`, ne jen na
Heading/Paragraph — takže tučné úseky se dají přepsat bez rozbití
formátování. Když je tučný úsek na jiném místě než v předloze, přesune se
`move_element`; přebytečné fragmenty se mažou `remove_element`.

DOM id sekce se **nenastavuje** přes `set_attributes` (skončí interní
chybou) — patří na to `data_element_settings_tool > set_dom_id`.

## Čtení velkého Figma souboru

`get_metadata` na celou sekci Produkty vrací ~730 KB a do kontextu se
nevejde. Harness ho uloží do souboru — grepovat, ne číst celý.
Identifikace framů: jména vrstev nesou názvy produktů, screenshot horních
~1100 px framu stačí na potvrzení. `get_design_context` volat na
jednotlivé sekce, nikdy na celý frame.
