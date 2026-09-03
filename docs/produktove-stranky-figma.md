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
| `1921:2203` | Orientační systémy | `6401fcf4e07002bda0fea1d5` | 0 | 0 | |
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

## Postup přestavby jedné stránky

1. `create_page` s `duplicateOf` vzorové stránky → dostane se client-first
   struktura i Relume bloky bez zakládání nových tříd.
2. Naplnit obsahem podle Figma framu, sekcí po sekci.
3. Galerie se nepředělávají — jen se zařadí pod správnou `section_product`.
4. Ověřit na preview.
5. Prohodit slugy: stará stránka `…-old` + draft, nová na ostrý slug. URL
   i SEO zůstanou, stará verze slouží jako záloha. Stejně jako
   `(old) 3D nápisy, loga a jednotlivá písmena`.
6. Publikace až po odsouhlasení — publish pouští ven i cizí rozdělanou
   práci, viz CLAUDE.md.

## Čtení velkého Figma souboru

`get_metadata` na celou sekci Produkty vrací ~730 KB a do kontextu se
nevejde. Harness ho uloží do souboru — grepovat, ne číst celý.
Identifikace framů: jména vrstev nesou názvy produktů, screenshot horních
~1100 px framu stačí na potvrzení. `get_design_context` volat na
jednotlivé sekce, nikdy na celý frame.
