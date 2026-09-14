# Nálezy z překladu nových `/dev/` stránek

Sebráno 14. 9. 2026 při překladu osmi nových produktových stránek do EN a DE.
Nic z toho jsem neopravoval — je to k rozhodnutí a zpracování.

Stránky, kterých se to týká:

| `/dev/` | page_id |
|---|---|
| `vystrce-lekarenske-znaky` | `6a9aa82d1bc055833d458566` |
| `velkoformatovy-tisk` | `6a9aada633cfcc4604230b5f` |
| `vstupni-portaly` | `6a9ab01047299df13695660e` |
| `prvky-podpory-prodeje` | `6a9ab0f0fdf55c29d79dc962` |
| `designova-svitidla` | `6a9ab353346c1fa008c113d7` |
| `zamecnicke-konstrukce` | `6a9aa29d3f076848d52e7d63` |
| `svetelne-panely-a-tabule` | `6a9ab1e40aec35eaf9d1edec` (draft) |
| `orientacni-systemy` | `6a99120f6934e22ce69ad69d` |

---

## 1. Obrázky v EN a DE ukazují fotky z jiné stránky

Nejzávažnější věc na seznamu, protože je vidět na první pohled.

Stránky vznikly duplikací `/produkty/3d-napisy-loga-a-jednotliva-pismena`.
Spolu s obsahem se přenesly i **locale override obrázků**. Návštěvník na `/en`
a `/de` tedy vidí u textu o výstrčích, tisku nebo svítidlech fotografie 3D
nápisů.

| Stránka | EN | DE |
|---|---|---|
| `velkoformatovy-tisk` | 9 obrázků | 1 obrázek (`20712323-…74cf8b`) |
| `vstupni-portaly` | 7 obrázků | v pořádku |
| `prvky-podpory-prodeje` | všech 7 | 2 ze 7 |
| `designova-svitidla` | 13 obrázků | 5 obrázků |
| `svetelne-panely-a-tabule` | 3 obrázky | tytéž 3 |
| `vystrce-lekarenske-znaky` | v pořádku | 2 obrázky (staré assety z 5/2026) |
| `orientacni-systemy` | 2 obrázky | v pořádku |
| `zamecnicke-konstrukce` | v pořádku | 2 override, ale míří na stejné assetId jako čeština — vizuálně beze změny |

Seznamy konkrétních uzlů a assetId jsou v transcriptu překladu; na vyžádání je
vypíšu. **Lokalizaci obrázků API nezapíše** — jde to jen v Designeru (buď
přepnout na správné fotky, nebo override smazat, aby se dědila čeština).

---

## 2. Vady v českém originále

Do primárního locale se přes API zapsat nedá, takže všechno níž je na Designer.

### Opakuje se na všech stránkách

| Co | Kde |
|---|---|
| „Jejda, **fotografie** nepodařilo se zobrazit. Zkuste stránku znovu načíst." | 3–6× na každé z osmi stránek |
| „No items found." — anglický Webflow default jako prázdný stav fotogalerie | 3–6× na každé stránce, i v české verzi |
| Tlačítko „Jak probíhá výroba?" má `href="#"` | uzel `12d758e8-b4c1-5e3d-1d60-e1f93db77e9d`, většina stránek; sekce, na kterou má mířit, je přitom níž na téže stránce |

### Počet let na trhu

„**37 let zkušeností**" je natvrdo v HTML (uzel `65805fe8-…c596`) na stránkách
velkoformátový tisk, vstupní portály, prvky podpory prodeje, designová svítidla
a zámečnické konstrukce. Není tam `<span data-var="YOE">` ani token `{#YOE#}`.

Dvě věci k tomu: každý rok se to bude muset ručně přepsat ve třech jazycích,
a `src/modules/10-vars.js` počítá YOE od `BASE_YEAR 1990`, takže token by dnes
vypsal **36**. Zbytek webu ukazuje 34. Tři různá čísla pro totéž tvrzení.

### Meta titulky a descriptions

| Stránka | Co je |
|---|---|
| `velkoformatovy-tisk` | title nezmiňuje polepy ani designové obrazy (2 ze 4 sekcí), description chybí úplně |
| `vstupni-portaly` | title „Vstupní portály" vs. H1 „Vstupní portály a architektonické prvky", description chybí |
| `prvky-podpory-prodeje` | title nezmiňuje LED technologie, description chybí |
| `designova-svitidla` | description chybí |
| `zamecnicke-konstrukce` | title ani description nezmiňují plexisklo, přestože mu stránka věnuje třetinu obsahu |
| `svetelne-panely-a-tabule` | title zní „Tabule, světelné panely a **výstrče**" — výstrče mají dnes vlastní stránku; description chybí |

Anglické a německé meta jsem proto psal podle H1 a obsahu stránky, ne podle
české předlohy.

### Název stránky vs. H1

- `vystrce-lekarenske-znaky`: název „Výstrče **a** lékárenské znaky", H1 „Výstrče**,** lékárenské znaky"
- `prvky-podpory-prodeje`: název „Prvky podpory prodeje **a** LED technologie", H1 s čárkou
- `velkoformatovy-tisk`: název „Velkoformátový tisk a řezaná grafika", H1 „Velkoformátový digitální tisk, řezaná grafika, polepy" — ani jeden nezmiňuje sekci Designové obrazy
- `designova-svitidla`: H1 „Neonová a LED neonová designová svítidla", ale stránka nabízí i mechové stěny, cortenový plech, čísla domů a stojací lampy

### Překlepy a formulace

| Stránka | Co |
|---|---|
| `designova-svitidla` | „Klasické **sklěněné** neonové trubice" (uzel `c9352813-…62745e`) |
| `designova-svitidla` | chybí mezera za `</strong>`: „Materiál:patinující ocel", „Umístění:cortenová ocel" (uzly `b0a3ee2d-…94df`, `…94e3`) |
| `designova-svitidla` | „snadno se udržují a **nevyžadují žádnou údržbu** jako živé rostliny" |
| `designova-svitidla` | „jako vystřižená z Las Vegas na **počátku 20. století**" — žárovková éra Fremont Street jsou 30. a 40. léta |
| `prvky-podpory-prodeje` | nadpisy „LED **displaye**" 2×, přitom o dva řádky níž v témže odstavci stojí „LED displeje" |
| `prvky-podpory-prodeje` | „7 a 9segmentové", „14 a 16segmentové" — u osamoceného čísla chybí spojovník |
| `prvky-podpory-prodeje` | „Zpracování:" je na stránce 2× pro dvě různé věci (barvy a materiály vs. montáž obrazovek) |
| `velkoformatovy-tisk` | „Bezpečnostní prvky pro **šeroslepé** pomáhají s bezpečným pohybem **slabozrakým**" — dvě různé diagnózy v jedné větě |
| `vstupni-portaly` | „V **Elektru** Drapač milujeme výzvy" — skloňovaný název firmy; glosář to u němčiny vede jako chybu, tady je to v češtině |
| `vystrce-lekarenske-znaky` | „Lékárenské znaky jsou **pod** autorským zákonem" (perex) vs. „Jsou chráněny autorským zákonem" (hlavní sekce) |
| `vystrce-lekarenske-znaky` | „zajišťuje rovnoměrnou viditelnost **i** za špatného počasí **i** po setmění" |
| `svetelne-panely-a-tabule` | „Plexi intarzie" (nadpisy) vs. „plexiintarzie" (podnadpisy) |
| `orientacni-systemy` | v jedné odpovědi Q&A tři `<br>` po sobě, v paralelní dva — různě velké odstupy |

### Duplicitní a zbytkový obsah

- `vystrce-lekarenske-znaky`: odrážka „Materiál: rám tvoří hliníková konstrukce…" je znak po znaku stejná v sekci Světelné výstrče i Atypické výstrče
- `zamecnicke-konstrukce`: „s důrazem na pevnost, funkčnost a dlouhou životnost konstrukce" 2×; celá věta o svařování, ohýbání a materiálech 2×
- `zamecnicke-konstrukce`: hero štítek „1–40 m výška" — rozsah výšky je vlastnost pylonů
- `vstupni-portaly`: štítky „Interiér i exteriér / Na míru" jsou identické u všech tří sekcí, „Na míru" je na stránce 4×
- `designova-svitidla`: sekce cortenu má dvě odrážky jako samostatné `<li>` mimo rich-text, zbylých šest sekcí používá jeden rich-text div
- `svetelne-panely-a-tabule`: dvě ze čtyř dlaždic v přehledu jsou obalené v `<strong>`, dvě ne

---

## 3. Věci, které API zapsat neumí

| Co | Detail |
|---|---|
| **Cíl odkazu per locale** | `href` ani vazba na stránku nejde přes lokalizaci změnit. Zápis vrátí prázdné `errors`, ale nic neudělá. Týká se tlačítka „Jak probíhá výroba?" a položky menu „Inspiration", která na `/en` i `/de` míří na `#`. |
| **Obrázky per locale** | Viz oddíl 1. |
| **Smazání propertyOverride** | Německé instance CTA tlačítka `474aa6ac-e508-caa3-7840-9950f1fa0e3c` mají na několika stránkách override „Leuchtreklame anfragen" — pozůstatek po duplikaci z 3D nápisů. Hodnota se náhodou shoduje s výchozím německým textem komponenty, takže dnes nic nerozbíjí, ale override tu instanci zamyká: budoucí změna CTA napříč webem ji tiše přeskočí. API override smazat neumí. |
| **Text a SEO v češtině** | Celý oddíl 2. |

---

## 4. Sdílené komponenty — němčina

Neopravoval jsem je, protože jsou na celém webu a podle `CLAUDE.md` se do nich
nemá sahat, když může souběžně pracovat jiný chat.

| Komponenta | Uzel | Co je |
|---|---|---|
| Důvěřují nám přední české i zahraniční firmy `1d9fa440-e302-a80a-1a1f-59c234af1b81` | `…1b87` | „Führende tschechische und ausländische Unternehmen **vertrauenuns**" — chybí mezera |
| Záruka prvotřídní kvality `9ca447eb-2025-36db-db45-381516c86386` | `…639f` | „…der richtigen **Lichtwerbung** für Ihr Unternehmen." Tatáž komponenta používá výš 5× „Leuchtreklame". Glosář předepisuje Leuchtreklame; stejná vada už se jednou opravovala v hero na homepage. |
| Záruka prvotřídní kvality | `…86388` | „Warum unsere Leuchtreklame die richtige Wahl **ist?**" — slovosled vedlejší věty zakončený otazníkem. EN varianta je oznamovací. |
| Footer_2024-12 `a943362c-5bde-1e9d-f3bc-bf151588a59c` | `…a5a7` | „Kostengünstige Komplettlösungen für **Lichtwerbung** vom Entwurf bis zur Installation." EN patička už na `illuminated advertising` srovnaná je. |

---

## 5. Až nové stránky nahradí produkční

- Menu míří na staré adresy. Například `prvky-podpory-prodeje` má v navbaru
  `/en|/de/produkty/prvky-podpory-prodeje-led-technologie` s kotvami
  `#prvky-podpory-prodeje`, `#led-displaye`, `#led-obrazovky`. Jestli ty kotvy
  na nové stránce existují, se přes lokalizační API zjistit nedá.
- `designova-svitidla` má v sekci stojacích lamp odkaz na
  `https://www.eldr.cz/produkty/designova-a-interierova-svitidla-specialni-projekty#neonove-napisy`,
  tedy na stránku, kterou má nahradit. Prefix jsem přeložil na `/en/` a `/de/`,
  ale až ta stará zmizí, cíl přestane existovat.
- Po publikaci ověřit, že se na `/en` a `/de` opravdu spouštějí interakce IX2.
  Na pěti stránkách měly původní překlady vymyšlená `data-w-id`, která
  v češtině neexistují — při přepisu jsem je nahradil českými originály.

---

## 6. Publikace na staging — vyřešeno

Šest voláním `publish_site` mezi 13:58 a 14:24 UTC se nic nestalo; `lastPublished`
zůstával na 12:35:58. Sedmý pokus v 18:18 prošel a od té doby publikace funguje
normálně. Příčina se nezjistila — volání vracelo úspěch po celou dobu.

**Poučení, které stojí za zapamatování:** `publish_site` vrací jen ozvěnu
parametrů, ne výsledek. Jediné spolehlivé ověření je `get_site` a pole
`lastPublished` (u stagingu na úrovni webu, u produkce u konkrétní domény).
Je to zapsané i v `CLAUDE.md`.

Poslední publikace na staging: **2026-09-14 21:02:50 UTC**. Produkce zůstává
na 09:27:02, nedotčená.

## 7. Drobnosti v překladu, které zůstaly

| Kde | Co |
|---|---|
| `velkoformatovy-tisk`, EN, uzel `c9352813-…62745e` | Při opravě termínu na `window cover film` se u `<p>` zdvojila třída: `margin-bottom margin-xsmall margin-bottom margin-xsmall`. Lokalizační API třídu vnořeného prvku připojuje místo nahrazení. Renderuje se stejně, opakovaným zápisem to jen roste. |
| `vystrce-lekarenske-znaky`, EN, uzel `12d758e8-…77e97` | H2 „Projecting signs of every type, made to measure" vypouští „provedení" z českého „Výstrče různých typů a provedení na míru". Němčina ho zachovává. |
| napříč stránkami | Týž český řetězec má na různých stránkách různý překlad: hláška fotogalerie (3 varianty v EN, 3 v DE), odstavec „Podívejte se blíže…" (3 v EN, 2 v DE), tlačítko „Jak probíhá výroba?" (2 v EN, 2 v DE). |
| `prvky-podpory-prodeje`, `zamecnicke-konstrukce` | Český meta title má „Rodinná firma / Rodinný podnik Elektro Drapač", EN i DE mají jen „Elektro Drapač". |
| `designova-svitidla` | Glosář píše „žárovkový" s uvozovkami (`"lightbulb" illuminated sign`, `„Glühlampen"-Leuchtschrift`), na stránce jsou bez uvozovek. A „cortenový plech" je v EN jako `corten steel signage`, glosář má `corten sheet`. |
| `orientacni-systemy`, EN, uzel `3fcad9d6-…fa0318` | Jediný uzel bez anglického override. Dědí českou hodnotu, která je „No items found.", takže anglicky se zobrazí správně — jen na ostatních stránkách ten uzel override má. |

---

## 8. Doplněno 14. 9. večer

- **Počet let na trhu je sjednocený** na jedinou značku `{#YOE#}` ve všech třech
  jazycích. Deset českých uzlů (pět živých produktových stránek a pět `/dev/`)
  i 26 uzlů v EN a DE. `<span data-var="YOE">` byl z primárního locale
  odstraněn, natvrdo psaná čísla 34 / 37 / 32 jsou pryč. Ověřeno spuštěním
  nasazeného bundlu nad staženými stránkami: vykreslí se **36**, všude stejně.
- **Bundle** je připnutý na merge commit `7ddae37`. GTM `GTM-W6PR2VX` i všechny
  čtyři Finsweet skripty v head zkontrolovány po zápisu.
- **Komponenty**: 24 oprav překladu mimo menu a patičku, 6 terminologických
  oprav v menu, 20 nálezů v obou patičkách včetně „ELEKTRO DRAPER" →
  „ELEKTRO DRAPAČ".

### Co zůstává mimo rozsah a nebylo opraveno

| Kde | Co |
|---|---|
| `/de/` reference (CMS kolekce Reference) | Zákaznické citace používají „Lichtwerbung" místo glosářového „Leuchtreklame", 6×. Jsou to citace zákazníků, takže je otázka, jestli se do nich vůbec má sahat. V jedné je navíc rozbité „für die **hervorArbeit**". |
| `/de/servisni-sluzby-a-pronajem-plosin` | V Q&A bloku věta „Jede Lichtwerbung würde niemals es sollte tagsüber nicht scheinen…" — rozpadlý strojový překlad. |
| `Footer_2024-12`, uzel `a943362c-…a5e9` | Nemá žádnou `show--xx` třídu, takže se zobrazuje souběžně s jazykově hlídaným `a5eb`. Duplicitní odkaz jde odstranit jen v Designeru; text jsem srovnal. |
