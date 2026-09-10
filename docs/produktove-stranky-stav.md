# Přestavba produktových stránek — stav a zadání

Živý stav rozpracované série. **Čte se jako první**, když práce pokračuje
v nové session. Postup, mapa framů a technické limity jsou v
`produktove-stranky-figma.md`, texty z návrhu v
`produktove-stranky-texty.md`, element ID v `produktove-stranky-id-mapa.md`.

## Rozhodnutí zadavatele (3. 9. 2026)

1. **Sekce, které jsou v návrhu, ale nevede na ně odkaz z menu**
   („Atypické zámečnické konstrukce", „Atypické výstrče", „Designové
   obrazy") — **postavit** a **přidat odkaz do menu**. V sekundárních
   locale je odkaz **skrýt** combo třídou `localization-show-only_cs`.
2. **Publikuje se jednou, až bude hotová celá série.**
3. **Obrázky se do stránek nevkládají** — zápis přes API rozbije `sizes`
   a obrázek zešedne. Člověk je v Designeru překlikne podle seznamu níž.
4. **Nejednoznačnosti se neobcházejí** — zvolí se nejbližší rozumná
   varianta a zapíše se do „Rozhodnutí učiněná za pochodu".

## Konvence produktového obrázku (10. 9. 2026)

`product_image-wrapper` má **vždycky** combo třídu `clipped` a uvnitř
**jediný** obrázek `product_image` — bez `localization-show-only_*`.

Tři jazykové sloty zůstávají jen tam, kde je na obrázku **český text**,
který se musí přeložit: **Světelné panely a tabule** a **3D nápisy**.
Nikde jinde ne — fotka bez textu je pro všechny jazyky stejná.

Hotovo na: Zámečnické, Výstrče, Velkoformátový tisk, Vstupní portály,
Prvky podpory prodeje, Designová svítidla. Nesaháno na: Světelné panely
a tabule, 3D nápisy, Pylony a totemy (ty jsou podle zadavatele 1:1).

## Obrázky z Figmy v assetech (10. 9. 2026)

Všechno leží pod `Produkty / <Produkt> / {Hero, Produkt, Karty}`.
Názvy souborů odpovídají kotvě sekce, takže se v Designeru vybírají podle
jména, ne podle náhledu.

| Produkt | složka | Hero | Produkt | Karty |
|---|---|---|---|---|
| Výstrče | `6aa30fa01ac8ca35690d3775` | `6aa30faec395276afa5065fd` | `6aa30faf9ddbae94d8d1fb5d` | `6aa30faf1ac8ca35690d3aa3` |
| Velkoformátový tisk | `6aa30fa042f3452230753c03` | `6aa30faf719b2d58cd0d3e10` | `6aa30faf8ca79fa57be1bdf4` | `6aa30fafad0e44f64602831d` |
| Vstupní portály | `6aa30fa142f3452230753c23` | `6aa30faf466f13cadb572f6a` | `6aa30faf877a467eaa43803b` | `6aa30fb0976f8d96e6d6186e` |
| Prvky podpory prodeje | `6aa30fa1bda15d8c3504bf75` | `6aa30fb0976f8d96e6d61895` | `6aa30fb04f2a2d65e79b9b8e` | `6aa30fb07928fa48c011c0c6` |
| Designová svítidla | `6aa30fa17749407044bad08e` | `6aa30fb0d5fd851fcb6f9a3b` | `6aa30fb182720f7758da50b6` | `6aa30fb182720f7758da50cb` |

Orientační systémy (`6a99a9ba4dfafeff4a964328`) a Zámečnické konstrukce
(`6a9aa4837d59ae6369c9862a`) podsložky nemají — jejich obrázky vznikly dřív.

### Co se s obrázky dělalo

- **Produkt** — ořezáno na 1:1, předmět doprostřed, JPEG q92, max 2200 px.
  Ořez hledá těžiště hran a jasu; u šesti fotek byl posunutý ručně.
  Šikmý ořez se **nedělá** — dělá ho `clipped` v CSS.
- **Hero** — beze změny. Export je 5760 × 1408 px (4:1). Přidat 15 % nahoře
  a dole nejde, ty pixely v exportu nejsou; šlo by to jen dogenerovat.
- **Karty** — beze změny. Export je 1792 × 549 nebo 1346 × 558 px, což
  odpovídá pásu `layout400_card-image-wrapper` (výška 9 rem).

### Rozlišení produktových fotek

Sedm zdrojů (corten, mechové stěny, LED displeje, čísla domů, řezaná
grafika, výstrče, úvod tisku) přišlo z Figmy jen v 1254 × 1102 px. Jejich
čtvercový ořez má 1102 px — na půlku šířky ve 2× retině to stačí přesně,
rezerva žádná. Ostatní jsou 2000–2200 px.

### Návrh nemá fotku pro

`#led-obrazovky` (Prvky podpory prodeje) — v návrhu je na místě fotky jen
barevná plocha. Slot zůstal prázdný.

SAGASSER se v návrhu používá dvakrát: jako karta „Architektonické prvky"
(Vstupní portály) a jako karta „LED displaye" (Prvky podpory prodeje).
Není to omyl v přiřazení, tak to má návrh.

## Stav stránek

Všech sedm stránek stojí v `/dev/`, je vyřazených ze sitemapy
a nepublikovaných.

| Stránka | `/dev/` slug | pageId | Sekcí | Struktura | Texty | Galerie | Obrázky |
|---|---|---|---|---|---|---|---|
| Orientační systémy | `orientacni-systemy` | `6401fcf4e07002bda0fea1d5` | 1 | hotovo | hotovo | hotovo | ráno |
| Zámečnické konstrukce | `zamecnicke-konstrukce` | `6a9aa29d3f076848d52e7d63` | 3 | hotovo | hotovo | hotovo | ráno |
| Výstrče, lékárenské znaky | `vystrce-lekarenske-znaky` | `6a9aa82d1bc055833d458566` | 3 | hotovo | hotovo | 2 ze 3 | ráno |
| Velkoformátový tisk | `velkoformatovy-tisk` | `6a9aada633cfcc4604230b5f` | 4 | hotovo | hotovo | 3 ze 4 | ráno |
| Vstupní portály | `vstupni-portaly` | `6a9ab01047299df13695660e` | 3 | hotovo | hotovo | hotovo | ráno |
| Prvky podpory prodeje | `prvky-podpory-prodeje` | `6a9ab0f0fdf55c29d79dc962` | 3 | hotovo | hotovo | 2 ze 3 | ráno |
| Světelné panely a tabule | `svetelne-panely-a-tabule` | `6a9ab1e40aec35eaf9d1edec` | 4 | hotovo | hotovo | hotovo | ráno |
| Designová svítidla | `designova-svitidla` | `6a9ab353346c1fa008c113d7` | 7 | hotovo\* | hotovo | 6 ze 7 | ráno |

\* Sedmá sekce („Reklama z cortenového plechu") se musela **postavit
ručně** — vzorová stránka má jen šest produktových sekcí a API neumí
sekci naklonovat. Postavená sekce je textová: má oddělovač, štítky,
nadpis a tři odstavce, ale **nemá produktovou fotku, tlačítko ani
galerii** a chybí jí odsazovací utility třídy (builder je odmítl).
Viz „Co je jinak, než by mělo být".

## Sekce podle návrhu

Hvězdička = sekce bez odkazu v menu (rozhodnutí 1).

| Stránka | Sekce v pořadí podle návrhu |
|---|---|
| Orientační systémy | `orientacni-systemy` |
| Zámečnické konstrukce | `zamecnicke-konstrukce`, `atypicke-zamecnicke-konstrukce`\*, `opracovani-a-prodej-plexiskla` |
| Výstrče | `vystrce`, `atypicke-vystrce`\*, `lekarenske-znaky` |
| Velkoformátový tisk | `uvod`, `rezana-grafika`, `dalsi-druhy-polepu`, `designove-obrazy`\* |
| Vstupní portály | `vstupni-portaly`, `architektonicke-prvky`, `vlajky` |
| Prvky podpory prodeje | `prvky-podpory-prodeje`, `led-displaye`, `led-obrazovky` |
| Světelné panely a tabule | `svetelne-panely`, `intarzie`, `reklamni-tabule`, `menuboardy` |
| Designová svítidla | `designova-svitidla`, `zarovkove-svetelne-napisy`, `neonove-napisy`, `mechove-steny`, `reklama-z-cortenoveho-plechu`, `svetelna-cisla-domu`, `stojaci-lampy` |

## Co člověk udělá ráno

### A. Obrázky — proč to nejde přes API

Zápis obrázku přes API rozbije atribut `sizes` a fotka se zobrazí
rozmazaně (detail v `produktove-stranky-figma.md`). Každý obrázek se
proto musí **v Designeru vybrat znovu ručně** — tím se `sizes`
přepočítá. Týká se to hero fotky, obrázků na kartách rozcestníku
a produktových fotek v sekcích.

**Produktová fotka je jen jedna** pro všechny jazyky (viz konvence výš).
Tři jazykové sloty zůstaly jen u Světelných panelů a 3D nápisů, kde je
na grafice český text.

### B. Hero fotky — konkrétní soubory

Pět stránek má hero přímo z návrhu, nahraný a pojmenovaný. Zbytek bere
tutéž fotku, jakou má dnes živý web.

| Stránka | Asset |
|---|---|
| Výstrče | `Produkty / Výstrče / Hero / hero.png` (T-Mobile výstrč) |
| Velkoformátový tisk | `Produkty / Velkoformátový tisk / Hero / hero.png` (plachta ČSOB) |
| Vstupní portály | `Produkty / Vstupní portály / Hero / hero.png` (zelený portál) |
| Prvky podpory prodeje | `Produkty / Prvky podpory prodeje / Hero / hero.png` (růžové T) |
| Designová svítidla | `Produkty / Designová svítidla / Hero / hero.png` (neony na stropě) |
| Světelné panely a tabule | `Sětelné znaky - Profil 8 (0001) 2.avif` (`68c02a773967296e4cfa1995`) |
| Zámečnické konstrukce | `…_IMG_3839.webp` (`688755592e0a6fffa66ae8c6`) — hero se z Figmy nepodařilo stáhnout |

### C. Produktové fotky, které už na webu jsou

Tyhle stačí vybrat z assetů, jsou to přesně ty ze staré verze stránky:

| Stránka / sekce | cs | en | de |
|---|---|---|---|
| Výstrče / `#vystrce` | `Vystrc se zasunutym plexi 1.png` | jen jeden obrázek | — |
| Světelné panely / `#svetelne-panely` | `Svetelny panel.png` | `Svetelny panel_EN.png` | `Svetelny panel_DE.png` |
| Světelné panely / `#intarzie` | `Plexiintarzie podlozena.png` | `Plexiintarzie podlozena_EN.png` | `Plexiintarzie podlozena_DE.png` |
| Světelné panely / `#reklamni-tabule` | `Reklamni tabule.png` | `Reklamni tabule_EN.png` | `Reklamni tabule_DE.png` |
| Světelné panely / `#menuboardy` | `UHK 1.avif` | — | — |
| Zámečnické / `#zamecnicke-konstrukce` | `zamecnicke-konstrukce.jpg` (`6a9aa48beb68c246d9a5deef`) | — | — |
| Zámečnické / `#atypicke-zamecnicke-konstrukce` | `atypicke-zamecnicke-konstrukce.jpg` (`6a9aa48badd0e01507de20f2`) | — | — |
| Zámečnické / `#opracovani-a-prodej-plexiskla` | `opracovani-a-prodej-plexiskla.jpg` (`6a9aa48cadd0e01507de2121`) | — | — |
| Orientační systémy / hero | `Produkty / Orientační systémy / hero.webp` | — | — |
| Orientační systémy / sekce | `Produkty / Orientační systémy / orientacni-systemy-budov-a-arealu.png` | — | — |

Zámečnické fotky jsou ve složce **Produkty / Zámečnické konstrukce/**.

### D. Produktové fotky z návrhu

Devatenáct fotek z návrhu je ořezaných na 1:1 a nahraných. Leží ve
složce **Produkty / <Produkt> / Produkt/**, soubor se jmenuje podle
kotvy sekce — `#vystrce` → `vystrce.jpg`.

| Stránka | Sekce → soubor |
|---|---|
| Výstrče | `vystrce.jpg`, `atypicke-vystrce.jpg`, `lekarenske-znaky.jpg` |
| Velkoformátový tisk | `uvod.jpg`, `rezana-grafika.jpg`, `dalsi-druhy-polepu.jpg`, `designove-obrazy.jpg` |
| Vstupní portály | `vstupni-portaly.jpg`, `architektonicke-prvky.jpg`, `vlajky.jpg` |
| Prvky podpory prodeje | `prvky-podpory-prodeje.jpg`, `led-displaye.jpg` |
| Designová svítidla | `designova-svitidla.jpg`, `zarovkove-svetelne-napisy.jpg`, `neonove-napisy.jpg`, `mechove-steny.jpg`, `reklama-z-cortenoveho-plechu.jpg`, `svetelna-cisla-domu.jpg`, `stojaci-lampy.jpg` |

Zbývá jen `#led-obrazovky` (Prvky podpory prodeje) — návrh tam fotku
nemá, je tam barevná plocha. Vyber prosím vlastní z galerie produktu.

Sekce Zámečnických a Světelných panelů mají fotky ze staré verze
stránky, viz tabulka v části C.

### E. Obrázky na kartách rozcestníku

Dvacet karet z návrhu je nahraných beze změny ve složce
**Produkty / <Produkt> / Karty/**. Soubor se jmenuje podle kotvy sekce,
na kterou karta odkazuje, s příponou `-karta`.

| Stránka | Karty |
|---|---|
| Výstrče | `vystrce-karta.png`, `atypicke-vystrce-karta.png`, `lekarenske-znaky-karta.png` |
| Velkoformátový tisk | `uvod-karta.png`, `rezana-grafika-karta.png`, `dalsi-druhy-polepu-karta.png`, `designove-obrazy-karta.png` |
| Vstupní portály | `vstupni-portaly-karta.png`, `architektonicke-prvky-karta.png`, `vlajky-karta.png` |
| Prvky podpory prodeje | `prvky-podpory-prodeje-karta.png`, `led-displaye-karta.png`, `led-obrazovky-karta.png` |
| Designová svítidla | `designova-svitidla-karta.png`, `zarovkove-svetelne-napisy-karta.png`, `neonove-napisy-karta.png`, `mechove-steny-karta.png`, `reklama-z-cortenoveho-plechu-karta.png`, `svetelna-cisla-domu-karta.png`, `stojaci-lampy-karta.png` |

Zámečnické a Světelné panely karty z návrhu nemají — zůstávají zděděné
z 3D nápisů.

### F. Sekce bez galerie v CMS

Čtyři sekce z návrhu nemají v poli **Fotogalerie** (kolekce Fotografie)
svou možnost a přes API ji nejde přidat. U těch je galerie **skrytá**:

| Sekce | Stránka |
|---|---|
| Atypické výstrče | Výstrče |
| Designové obrazy | Velkoformátový tisk |
| LED obrazovky | Prvky podpory prodeje |
| Reklama z cortenového plechu | Designová svítidla |

U „LED obrazovek" a „cortenu" je to stejné i na živém webu. U zbylých
dvou: až v CMS založíš možnost a otaguješ fotky, stačí galerii odkrýt
a nastavit filtr.

### G. Menu

Až budou stránky odsouhlasené, je potřeba do komponenty `Navbar_2024-12`
přidat tři odkazy — `#atypicke-vystrce`, `#atypicke-zamecnicke-konstrukce`
a `#designove-obrazy` — s combo třídou `localization-show-only_cs`.
**Zatím to není udělané**, protože navbar je společný pro celý web
a zásah do něj se projeví všude.

### H. robots.txt

`Disallow: /dev/` do Site settings → SEO. Dev stránky nemají `noindex`
a ze sitemapy je vyřazuje jen nastavení u stránky. API na robots.txt
nesahá.

### I. Nasazení a překlady — dohodnuté pořadí

Reklamy míří na dnešní adresy, takže **URL se měnit nesmí**. Prohození
slugu novou URL nevyrábí: nová stránka převezme slug té staré, stará
dostane `…-old`, adresa zůstane doslova stejná.

Překlady se ale ztratí tak jako tak — texty jsou nové, starý překlad by
neseděl. Proto pořadí:

1. prohodit slugy (nová stránka na ostrý slug, stará na `…-old`)
2. publikovat **jen na doménu webflow.io**, ne na produkci
3. nechat přeložit do EN a DE
4. publikovat na produkci

Mezi krokem 1 a 4 **nesmí nikdo publikovat na produkci** — Webflow pouští
ven celý web, takže by rozdělané stránky vystrčil s sebou.

Dev stránky mají kratší slugy než ostré verze, takže při kroku 1 musí
nová stránka převzít **slug staré**, jinak se rozbijí URL i odkazy v menu.

| Dev slug | Ostrý slug, který má převzít |
|---|---|
| `vystrce-lekarenske-znaky` | `vystrce-lekarenske-znaky` |
| `velkoformatovy-tisk` | `velkoformatovy-tisk` |
| `vstupni-portaly` | `architektonicke-prvky-vstupni-portaly-vlajky` |
| `prvky-podpory-prodeje` | `prvky-podpory-prodeje-led-technologie` |
| `svetelne-panely-a-tabule` | `tabule-a-svetelne-panely` |
| `designova-svitidla` | `designova-a-interierova-svitidla-specialni-projekty` |
| `zamecnicke-konstrukce` | `zamecnicke-konstrukce-na-miru-opracovani-plexiskla` |

## Co je jinak, než by mělo být

- **Sedmá sekce Designových svítidel** („Reklama z cortenového plechu")
  je postavená ručně a je jen textová — bez fotky, bez tlačítka „Nezávazně
  poptat", bez galerie a bez odsazovacích tříd. Nejrychlejší oprava je
  v Designeru zduplikovat sousední produktovou sekci, přepsat texty
  (jsou v `produktove-stranky-texty.md`), nastavit id
  `reklama-z-cortenoveho-plechu` a ručně postavenou sekci smazat.
- **Sedmá karta rozcestníku** na téže stránce je postavená stejným
  způsobem. Odkaz i texty sedí, ale fotka je zástupná.
- **Ikony v bloku `section_layout253`** zůstaly zděděné z 3D nápisů
  (štětec, štít). V návrhu jsou jinde zaškrtávátka nebo otazník. Chce to
  přepsat `code` v HTML embedu, nebo nechat být — je to drobnost.

## Rozhodnutí učiněná za pochodu

- **Chybný text karty u Výstrčí.** Návrh má u karty „Světelné výstrče"
  popis, který patří k „Atypickým výstrčím" (doslovná kopie). Použil se
  popis odvozený z vlastní sekce, aby karta popisovala svůj produkt.
- **Šest odrážek u „Polepů"** (Velkoformátový tisk) se sloučilo do tří —
  šablona má tři položky seznamu a přes API nejde další přidat. Obsah
  zůstal celý, jen po dvojicích: vozidla + výlohy, perforované + krycí,
  podlahy + prvky pro šeroslepé.
- **Blok „Výstrče různých typů"** má v návrhu čtyři varianty pod sebou,
  šablona `section_layout253` má dva sloupce. Varianty se rozdělily
  2 + 2, obsah zůstal celý.
- **Dvojblok „Vystouplá / Podložená plexiintarzie"** (Světelné panely) se
  přesunul do `section_layout253` hned za sekci Intarzie — tvarem je to
  přesně blok pro dvě položky.
- **Sekce „Lékárenské znaky"** má v návrhu tučný odstavec a dvě krátké
  odrážky; převedlo se to na tři odrážky (Oprávnění, Sortiment, Vhodné
  pro), aby to sedělo do šablony.
- **Popisy karet u Designových svítidel** se odvodily z úvodních vět
  sekcí — v návrhu jsou v tak nízkém rozlišení, že se nedaly přečíst.
- **Kroky procesu (`section_process-link`)** zůstaly, i když je návrh
  u nových stránek nekreslí. Zadání znělo držet se struktury dvou
  hotových stránek.
- **Tlačítko v bloku `section_layout253`** („Jak probíhá výroba?")
  zůstalo, i když ho návrh v tomhle bloku nemá. Je to funkční odkaz na
  sekci níž.
- **Pořadí štítků v hero.** Šablona je má v pořadí Kompletní servis →
  Úsporné LED → Odborná montáž → Životnost desítky let, návrh přesně
  obráceně. Nové stránky mají pořadí podle návrhu.
- **Štítky v produktových sekcích.** Šablona má tři, návrh dva a oba
  s ikonou. Maže se první štítek (jediný bez ikony) a druhému se přidá
  odsazení — levnější než ikonu dostavovat.

## Co zůstalo nedodělané

- **Figma MCP došly volání** („You've reached the Figma MCP tool call
  limit on the Starter plan"). Návrh se proto četl ze screenshotů framů
  pořízených dřív a obrázky se přes MCP stáhnout nedaly. **Vyřešeno
  ručně:** zadavatel exportoval frame z Figmy sám a nahrál ho do assetů
  do `figma_zdroje/{Hero, Produkty, Karty}`. Odtud se soubory ořezaly,
  pojmenovaly a zařadily — viz „Obrázky z Figmy v assetech".
- **Sedmá karta a sedmá sekce Designových svítidel** mají teď správnou
  fotku v assetech (`stojaci-lampy.jpg`, `stojaci-lampy-karta.png`),
  ale sekce samotná je pořád ta ručně postavená textová — viz „Co je
  jinak, než by mělo být".
- **Kotvy ověřené proti menu.** Všech 23 id sekcí na nových stránkách
  sedí znak po znaku s odkazy, které navbar na živém webu používá.
  Ověřeno vytažením `href="/produkty/…#…"` z živého HTML a porovnáním
  s `attributes.id` každé sekce přes API.
- **Vizuální kontrola v prohlížeči.** Playwright se v tomhle prostředí
  přes proxy nedostane ven, takže stránky nejsou prohlédnuté očima —
  jen ověřené přes API. Než se bude publikovat, projdi je v Designeru.
- **Překlady EN a DE** jsou u nových stránek prázdné. Slugy se
  neprohazují, dokud nebudou hotové.
