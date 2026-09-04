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

**Produktová fotka má tři jazykové sloty** (`localization-show-only_cs`
/ `_en` / `_de`). Dokud nejsou překlady, stačí vyplnit **cs**; ostatní
dva se doplní s překlady.

### B. Hero fotky — konkrétní soubory

Návrh používá tytéž hero fotky, jaké má dnes živý web. Stačí je
v Designeru vybrat z assetů:

| Stránka | Asset |
|---|---|
| Výstrče | `Sětelné znaky - Profil 8 (0001) 1.png` (T-Mobile, `6a3a24133f8238fbc7825404`) |
| Velkoformátový tisk | `velkoformat-hero.webp` (`68b4b2d487e457b5e3ffbe1e`) |
| Vstupní portály | `vstupni-portaly-hero.webp` (`68b4a90842e2b142ba3d89b1`) |
| Prvky podpory prodeje | `Upscale Media Transformed.webp` (`6910d644c29abfe842ab67ab`) |
| Světelné panely a tabule | `Sětelné znaky - Profil 8 (0001) 2.avif` (`68c02a773967296e4cfa1995`) |
| Designová svítidla | `Upscale Media Transformed (1).webp` (`6910d9666c5dbe31a0507e27`) |
| Zámečnické konstrukce | `…_IMG_3839.webp` (`688755592e0a6fffa66ae8c6`) — ověřit proti návrhu, hero se z Figmy nepodařilo stáhnout |

Ověřeno porovnáním hero fotky z návrhu proti živé stránce (Výstrče:
shoda). U ostatních stránek je to tentýž vzorec.

### C. Produktové fotky, které už na webu jsou

Tyhle stačí vybrat z assetů, jsou to přesně ty ze staré verze stránky:

| Stránka / sekce | cs | en | de |
|---|---|---|---|
| Výstrče / `#vystrce` | `Vystrc se zasunutym plexi 1.png` | `Vystrc se zasunutym plexi 6_EN.png` | `Vystrc se zasunutym plexi 4_DE.png` |
| Světelné panely / `#svetelne-panely` | `Svetelny panel.png` | `Svetelny panel_EN.png` | `Svetelny panel_DE.png` |
| Světelné panely / `#intarzie` | `Plexiintarzie podlozena.png` | `Plexiintarzie podlozena_EN.png` | `Plexiintarzie podlozena_DE.png` |
| Světelné panely / `#reklamni-tabule` | `Reklamni tabule.png` | `Reklamni tabule_EN.png` | `Reklamni tabule_DE.png` |
| Světelné panely / `#menuboardy` | `UHK 1.avif` | — | — |
| Zámečnické / `#zamecnicke-konstrukce` | `zamecnicke-konstrukce.jpg` (`6a9aa48beb68c246d9a5deef`) | — | — |
| Zámečnické / `#atypicke-zamecnicke-konstrukce` | `atypicke-zamecnicke-konstrukce.jpg` (`6a9aa48badd0e01507de20f2`) | — | — |
| Zámečnické / `#opracovani-a-prodej-plexiskla` | `opracovani-a-prodej-plexiskla.jpg` (`6a9aa48cadd0e01507de2121`) | — | — |
| Orientační systémy / hero | `Produkty / Orientační systémy / hero.webp` | — | — |
| Orientační systémy / sekce | `Produkty / Orientační systémy / orientacni-systemy-budov-a-arealu.png` (do všech tří slotů) | | |

Zámečnické fotky jsou ve složce **Produkty / Zámečnické konstrukce/**.

### D. Produktové fotky, které v assetech nejsou

U zbylých sekcí návrh ukazuje fotku, která na starém webu není a **z
Figmy se ji nepodařilo stáhnout** (viz „Co zůstalo nedodělané"). Ve
stránce je zatím zděděná fotka z 3D nápisů. Vyber prosím vlastní fotku
z galerie daného produktu — je to:

- **Velkoformátový tisk** — `#uvod` (bankomat era), `#rezana-grafika`
  (interiér KFC), `#dalsi-druhy-polepu` (pobočka ČSOB),
  `#designove-obrazy` (obrazy v kavárně)
- **Vstupní portály** — `#vstupni-portaly` (zelený prosvětlený portál),
  `#architektonicke-prvky` (hvězda Mercedes na střeše), `#vlajky`
  (vlajka ČSOB na fasádě)
- **Prvky podpory prodeje** — `#prvky-podpory-prodeje` (černé stojany
  MG), `#led-displaye` (žlutý totem OLVAN); `#led-obrazovky` fotku
  v návrhu vůbec nemá
- **Designová svítidla** — všech sedm sekcí
- **Výstrče** — `#atypicke-vystrce` (výstrč Petřín Park),
  `#lekarenske-znaky` (zelený lékárenský kříž)
- **Zámečnické** — hero

### E. Obrázky na kartách rozcestníku

Karty na všech nových stránkách mají zděděné fotky z 3D nápisů. V návrhu
mají fotku odpovídající své sekci — vyber ji stejným způsobem.

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
  pořízených dřív a **obrázky z návrhu se nedaly stáhnout ani nahrát do
  assetů**. To je jediná část zadání, která se nesplnila — texty,
  struktura, kotvy i galerie hotové jsou. Až limit povolí (nebo po
  upgradu), stačí u každé sekce zavolat `download_assets` a fotky
  nahrát; postup je popsaný v `produktove-stranky-figma.md`.
- **Vizuální kontrola v prohlížeči.** Playwright se v tomhle prostředí
  přes proxy nedostane ven, takže stránky nejsou prohlédnuté očima —
  jen ověřené přes API. Než se bude publikovat, projdi je v Designeru.
- **Překlady EN a DE** jsou u nových stránek prázdné. Slugy se
  neprohazují, dokud nebudou hotové.
