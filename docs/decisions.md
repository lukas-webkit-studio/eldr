# Rozhodnutí

Rozhodnutí, která padla během štafety a nejsou v `CLAUDE.md`. Nejnovější
nahoře. Formát: datum · kdo · rozhodnutí · proč · odkaz.

## 2026-11-20 · S11 · Horní pruh s akcí (#62)

Lukáš 19. 11. po telefonu s Myškou: pruh podle návrhu Evisions na staging, varianta podle design systému, UX a marketingu.

- **Varianta rotace** (koordinátor v #62). Běžící pás by soupeřil s pásem recenzí na homepage, neon bliká a zhoršuje čitelnost (WCAG 2.3).
- **Kód agentury se nepoužil.** Generoval HTML i CSS z JS, texty by nešly lokalizovat a `!important` by se pral s navbarem. Pruh je nativně v komponentě `Navbar_2024-12` jako první potomek `.navbar_component`, takže jede s fixním navbarem na všech stránkách. `.navbar_component` dostal `flex-direction: column`, `align-items: stretch`.
- **Odsazení obsahu: `padding-top` na tagu `body`.** Navbar je `fixed` a stránky počítají s jeho výškou každá jinak. Kontakty nemají `.page-wrapper` (rodičem navbaru je `body`), takže jediný společný předek všech stránek je `body`. Ve Webflow má `body` 44 px (≤ 767 px 77 px, tři řádky) jako zálohu bez JS. Modul přepíše inline hodnotu na změřenou výšku pruhu a po zavření nebo konci akce na 0. Navbar i obsah se tak posunou spolu a navigace neskočí. **Až se pruh z navbaru smaže, smazat i `padding-top` na `body`**, jinak zůstane nahoře mezera.
- **Bez JS je vidět první zpráva** (`.announcement_text` má `display: none`, `:first-child` `display: block`), pruh je odkaz a křížek je skrytý (bez JS by nic nedělal).
- **Zprávy leží v jedné buňce gridu.** Výška pruhu = nejdelší zpráva, při střídání se nehýbe navigace ani obsah. Na mobilu zpráva nejvýš na dva řádky a pod ní celá výzva (`flex-wrap`, výzva `nowrap`), pruh má 77 px (úprava po kontrole Lukáše 20. 11., původně jen šipka).
- **Odkaz je typu „stránka“ (Kontakty)**, ať se v `/en` a `/de` přepne jazyk. Kotvu `#formular` API u odkazu na stránku tiše zahodí (ověřeno čtením zpět), doplňuje ji modul. Kdo ji nastaví v Designeru (Page section), modul ji nezdvojí.
- **Popisek křížku je skrytý text, ne `aria-label`.** Atributy Webflow nelokalizuje, text ano: „Zavřít oznámení“ / „Close announcement“ / „Hinweis schließen“. Text je `div` uvnitř `button` (blok neumí `span`), prohlížeče i čtečky ho čtou správně.
- **Hover rotaci pozastaví jen z myši a pera.** Poslouchá `pointerover`/`pointerout`: když kurzor stojí nad pruhem už při načtení, Chromium `pointerenter` nepošle (zachytil test na stagingu). Dotyk posílá `pointerover` bez `pointerout` a rotace by po klepnutí zůstala stát (nález kontroly).
- **Konec akce** se kontroluje při načtení a při každém střídání zpráv. Datum je v `data-announcement-end` na prvku ve Webflow, jde změnit bez kódu.
- **Kontrast: veškerý text bíle (5,7 : 1), žlutá jen jako tečka** (Lukáš 20. 11. po kontrole). Žlutá `#f9b319` na červené `#cc1719` má 3,1 : 1, na text 13,5–15 px WCAG AA chce 4,5 : 1. Zvýraznění je bílé tučné (700), výzva bílá tučná podtržená se šipkou. Žlutá zůstala jako ne-textový akcent: tečka 8 px před zprávou (`.announcement_dot`, 3,1 : 1 splňuje 3 : 1 pro ne-textové prvky). Na mobilu je tečka skrytá: v zalamovaném flexu by si vzala vlastní řádek.
- **Hover celého pruhu ztmaví pozadí** (`--red-hover`). Šipka se posune, když je kurzor na výzvě: `:hover` na `.announcement_cta` zvětší mezeru mezi textem a šipkou (6 → 10 px). Posun při hoveru kdekoli na pruhu by byl selektor rodič → potomek, který Webflow nezapíše.
- **`scroll-margin-top` na `.sectionform`** (48 px, tablet 64 px, mobil 96 px). Po skoku na `#formular` byl nadpis formuláře pod vyšší navigací (test na stagingu: nadpis 120 px, navigace končí 128 px, na mobilu 64 × 131). Je to jediný zásah mimo pruh, jen styl třídy, obsah formuláře beze změny; kotvu používá i tlačítko „Kontaktujte nás“ v menu.
- **Šipka je `span` s `aria-hidden`**, čtečka přečte jen zprávu a „Zamluvit termín“. Původní blok se šipkou odmítal zápis atributu (konflikt v komponentě), byl nahrazen.

## 2026-11-16 · S10 · Pás recenzí: touchpad, kolečko a šipky (#59)

Lukáš 16. 11.: „bylo by možné i tah na touchpadu, např. na Macu dvěma prsty? Prostě vše, co mají i ostatní slidery na webu“.

- **Osa gesta `wheel` se zamyká podle první události** a drží, dokud 150 ms nepřijde další. Vodorovné gesto patří pásu (`preventDefault()`, stránka stojí), svislé stránce. Dojezdové události touchpadu jsou tak součást téhož gesta a šikmý konec gesta nic nepřepne.
- **Vlastní setrvačnost wheel nemá.** Dojezd posílá systém. Po poslední události pás 1 s stojí a rozjede se stejnou křivkou jako po puštění bez hození.
- **Hover má dál přednost.** Kurzor při gestu na touchpadu leží nad pásem, takže pás po gestu stojí, dokud kurzor neodjede. Stejně se chová po tahu myší (rozhodnutí z #54 čeká na Lukáše).
- **Shift + kolečko:** Chromium posílá `deltaY` se `shiftKey`, jiné prohlížeče rovnou `deltaX`. Modul bere obojí. Ctrl + kolečko (zoom, roztažení prstů) nezachytává.
- **Šipky posunou pás o rozteč karet** (karta a mezera, na desktopu 368 px) s dojezdem asi 0,5 s **a fokus přejde na sousední kartu**. Karta s fokusem tak zůstává na stejném místě obrazovky a neodjede pod ořez (nález nezávislé kontroly: bez přesunu fokusu byla po 2–4 stiscích oříznutá). Držená šipka jede zhruba čtyři karty za sekundu, nestřádá je. Tab chodí po kartách jako dřív. S Alt, Ctrl, Cmd a Shift se šipky nezachytávají (Alt + šipka je v prohlížeči zpět/vpřed).
- **O ose rozhoduje součet prvních 4 px**, ne první událost. Touchpad začíná gesto malými zašuměnými deltami a první událost (1, −1) by vodorovný švih zamkla jako svislý (nález kontroly). Nerozhodnutý pohyb do strany se ruší hned.
- **Známé meze, neřešeno:** nové gesto do 150 ms po dojezdu předchozího zdědí jeho osu. Šipka stisknutá během dojezdu touchpadu se přeruší.
- **`overscroll-behavior-x: contain` se na třídu ve Webflow nepřidalo.** Když pás řídí modul, nic nescrolluje, takže vlastnost nemá co omezit; gestu zpět/vpřed brání `preventDefault()`. Smysl by měla jen v režimu bez JS a s omezeným pohybem (nativní `overflow-x: auto`), a tam její účinek bez Macu ověřit nejde. Když Lukáš na Macu uvidí, že na kraji pásu v tomhle režimu stránka skočí zpět, patří vlastnost na třídu `testimonial21_marquee` ve Webflow.

## 2026-11-16 · S9 · Oprava po zkoušce na telefonu (#54)

Lukáš 16. 11. na telefonu: „není to moc smooth (ve stylu třeba dojezdu setrvačností), ale taky musím jet perfektně rovně do strany“.

- **O směru gesta rozhoduje modul, ne prohlížeč.** Po 5 px: do 45° od vodorovné je to tah pásu, strmější pohyb je scroll stránky. Zámek platí až do puštění, i když prst ujede svisle.
- **Dotyk a pero jdou přes Touch Events, myš přes Pointer Events.** S pouhým `touch-action: pan-y` rozhoduje prohlížeč a tah ukončí `pointercancel`. Spolehlivě tomu brání jen `preventDefault()` v nepasivním `touchmove`. Listener je jen na obalu pásu, scroll zbytku stránky neovlivní.
- **Po hození pás nezastavuje.** Rychlost puštění přechází jednou křivkou (útlum 2/s) rovnou do běžných −40 px/s. Hození doprava projde nulou a rozjede se doleva. Hover myší a fokus z klávesnice mají dál přednost, pod nimi pás zastaví.
- **U myši je tahem každý pohyb**, i strmý. Myš stránku tahem neposouvá, zámek na svislý směr by gesto jen umrtvil.
- **Když prohlížeč už scrolluje** (`touchmove` nejde zrušit), pás se nechytí. Jinak by se hýbal pás i stránka zároveň.
- **Ťuknutí ke konci dojezdu je obyčejné ťuknutí.** Stisk pás zastaví a kartu neotevře jen tehdy, když pás ještě jede o víc než 60 px/s rychleji nebo jinak než běžně.
- **Kontrola u dvou stolů (oprava):** devět nálezů v logice, opravené. Hlavní: dotyk v prohlížeči bez Touch Events pás zamrazil, pero šlo starou cestou, ťuknutí se polykalo ještě 2–3 s po hození, švihnutí s jediným pohybem se ztratilo.
- **Pauza 1 s jen po puštění bez hození** (pomaleji než 50 px/s), pak rozjezd stejným dorovnáním jako hover (2,5/s).
- **Rychlost puštění** je vážený průměr úseků z posledních 100 ms, novější váží víc. Mezera mezi posledním pohybem a puštěním nad 30 ms ji plynule snižuje k nule.
- **`will-change` jsem nepřidal.** Vlastní vrstvu už dělá `translate3d`. Snímkové časy v Chromiu se zpomaleným CPU 4× jsou bez něj 16,7 ms, žádný snímek nad 20 ms.
- **Obrázky trhání nezpůsobují:** 22 souborů, dohromady 1,04 MB, největší 106 kB (po zmenšení v S7).
- **První pixely tahu pás nedostane.** Prohlížeč pohyb do zhruba 10 px neposílá a pás se po zámku chytí bez skoku, takže za prstem zaostává o tuhle vzdálenost. Stejně se chovají běžné slidery.
- **Nejde ověřit odsud:** iOS Safari. WebKit v cloudové session není a Playwright v něm stejně neumí skutečné dotykové gesto. Ověřeno v Chromiu s emulací dotyku, telefon potvrzuje Lukáš.
- **Mimo `npm run check`:** průběh rychlosti po hození a pauzu měří jen `scripts/overeni/s9-pas-recenzi.js` v prohlížeči. Smoke test hlídá zámek směru, posun prstem a to, že pás po hození jede dál.

## 2026-11-16 · S9 · Pás recenzí: tah myší a prstem (#54)

- **`cursor`, `touch-action` a `user-select` jsou v JS jako inline styl, ne na třídě ve Webflow.** Platí jen tehdy, když pás řídí modul. Bez JS a při `prefers-reduced-motion` se pás posouvá nativně (`overflow-x: auto`) a `touch-action: pan-y` na třídě by tam vodorovný posun prstem zakázal. Style panel selektor `[data-marquee-ready]` zapsat neumí. Ve Webflow se kvůli S9 nezměnil žádný styl.
- **Kurzor `grab` je i nad kartami**, i když jsou to odkazy. Karty zabírají skoro celý pás, jinak by `grab` nebyl vidět. Že je karta klikací, dál ukazuje žlutý rámeček při hoveru.
- **Hover má přednost před rozjezdem.** Po tahu myší pás stojí, dokud je kurzor nad ním, a rozjede se až po odjetí myši. Odpovídá to schválenému chování z #26 (hover = stop). Na dotyku hover není, tam se rozjede vždy.
- **Hover se čte z Pointer Events a jen pro myš.** Po ťuknutí prstem posílá prohlížeč náhradní `mouseenter` a pás by stál až do ťuknutí jinam.
- **Fokus zastaví pás jen z klávesnice** (`:focus-visible`). Chrome dává odkazu fokus i po stisku myši; pás by po tahu zůstal stát.
- **Výběr textu je vypnutý jen po dobu stisku.** Recenzi jde dál označit dvojklikem a zkopírovat. `touch-action` je `pan-y pinch-zoom`, zoom dvěma prsty funguje i nad pásem.
- **Stisk během dojezdu pás hned zastaví** a kartu pod prstem neotevře. Pás se pak rozjede po pauze jako po puštění bez hození.
- **Kontrola u dvou stolů našla dvě vady, obě opravené:** ztracené puštění tlačítka (kontextové menu, puštění mimo pás před prahem) nechalo pás stát a pak ho přilepilo ke kurzoru; chycený dojezd jel pod prstem dál. K tomu oprava z ladění v prohlížeči: na dotyku tah ukončil `lostpointercapture` z karty.
- **Čísla platí od opravy 16. 11. odpoledne**, viz oddíl níž. Původní hodnoty (práh 6 px, útlum 4/s, pauza 2 s po každém puštění) Lukáš na telefonu odmítl.
- **Dev kopie a modul mají shodné tělo**, hlídá to `test/smoke.js`. Liší se hlavičkou a spuštěním (dev kopie nemá pomocníky z `00-core.js`).
- **Ověření v prohlížeči** je skript `scripts/overeni/s9-pas-recenzi.js` (Playwright není závislost repa, v cloudové session je globálně). `--local` podstrčí dev kopii z pracovního adresáře místo jsDelivr.

## 2026-11-02 · S8 · Nové články blogu

- Kolekce Inspirace nemá vlastní SEO pole; šablona bere meta description z `perex`. Do `perex` proto jde meta description ze zdroje (do 160 znaků), ne první odstavec jako u starších článků. První odstavec je úvodem `obsah`. (#38)
- Výzva na konci článku = nový malý banner v kolekci Bannery (5 záznamů), protože žádný existující textem neseděl. Tlačítko „Cenová nabídka zdarma“ → `/kontakty#formular` jako u ostatních malých bannerů. Name a slug česky ve všech locale (klíče). (#38)
- Celé tělo článku v `obsah` (Obsah č. 1), bez fotogalerie. Až přibudou fotky, dá se text rozdělit do `obsah-2-cast`. Tabulka v článku 1 je nativní `<table>` v rich textu. (#38)

## 2026-10-31 · S3 · Nižší karty recenzí (#46)

- **Obrázek 16:9**, ne 3:2. Na všech 22 fotkách zůstane nápis i logo celé (kontrola středového ořezu). 3:2 by kartu zvedlo o 36 px bez přínosu.
- **Pás 651 → 406 px** na 1440 × 900 (72 % → 45 % okna), mobil 591 → 390 px. Citace 3 řádky místo 6 (embed sekce), menší odsazení a mezery, mezera mezi kartami 1,5 → 1 rem (mobil 0,75 rem).
- **Vlastní třídy `testimonial21_company`, `_name`, `_position`** místo sdílených `SectionReference__Collection__Item__*`. Sdílené třídy platí i na `/reference`, jejich zmenšení by změnilo i tu stránku.
- **Název firmy víc dýchá** (Lukáš 31. 10. 9:10: „o dost lepší, jen nadpis ať trošičku víc dýchá“). +8 px nad názvem, mezi názvem a žlutou linkou a mezi linkou a citací, na mobilu +6 px. Pás 406 → 430 px (1440 × 900), mobil 390 → 408 px. Mezera linka → citace je `margin-top` na `testimonial21_quote`, protože sdílenou třídu linky (`Divider--Left--Yellow--56`) neměníme.
- **`srcset` u fotek v pásu přes API nejde.** Prvek obrázku na homepage i `image-8` na `/reference` mají v API stejná nastavení (vazba na `obrazek`, alt, viditelnost), přesto homepage `srcset` nevypisuje. Rozhoduje interní příznak prvku, který API neukazuje a nenastaví (potvrzeno i dotazem na Webflow AI). Prvek vložený v Designeru `srcset` dostane. Postup pro Designer je v #46. Fotky nahrané přes API jako `-1000.webp` nemají varianty `-p-500/-p-800` ani na `/reference`.
- **Zpomalení při hoveru zůstává na celém pásu** včetně mezer mezi kartami (`mouseenter` na `.testimonial21_marquee`). Nad nadpisem, tlačítkem a mimo sekci jede pás plnou rychlostí. Při 406 px pás už nezabírá celou obrazovku, takže kurzor na něm nezůstává náhodou.

## 2026-10-31 · S5 · Popis produktů pro AI na produktových stránkách (#35)

- **Zdroj údajů = viditelný text stránky bez JS.** `scripts/ai-vrstva/snapshot.js` renderuje stránku s vypnutým JavaScriptem a bere jen prvky, které nejsou `display:none`. Každý údaj v `data/ai-vrstva/*.json` má doslovnou citaci; `npm run check` ověřuje, že je ve snímku. EN/DE se citují z EN/DE stránek, nepřekládá se. Snímek je zmrazený: změnu webu ukáže až `test-dohledatelnost.js --live`.
- **Model JSON-LD: varianta D** — `WebPage` → `mainEntity` `Service` (kategorie stránky) → `hasOfferCatalog` → `OfferCatalog` → `Offer.itemOffered` → `Service` (jednotlivé výrobky, bez ceny). Parametry, materiály, provedení a použití jsou `additionalProperty` (`PropertyValue`), protože `Service` nemá `material`. Plus `BreadcrumbList` a `FAQPage` tam, kde stránka má otázku s odpovědí (orientační systémy, svítidla).
- **Proč ne `Product` (podle dokumentace Google, ne testem):** Google u `Product` vyžaduje `offers`, `review` nebo `aggregateRating`; bez nich výsledek označí jako chybu, podle zkušeností z fór i u vnořeného produktu. ELDR ceny na webu nemá a vymýšlet je nesmíme. `Service`, `OfferCatalog` a `WebPage` nejsou typy rich results Google.
- **Testy:** validator.schema.org dal u variant A (`Service`+katalog+`Product`), B (`CollectionPage`+`ItemList`+`Product`), C (`OfferCatalog`+`Product`) i D 0 chyb a 0 varování; u všech 30 výsledných grafů také. `material` přímo na `Service` dává varování `UNKNOWN_FIELD`. **Google Rich Results Test se z cloudového kontejneru spustit nedá** (formulář v headless prohlížeči nereaguje; ochranu proti robotům neobcházíme). Ruční test je v „Na Lukášovi“ v roadmapě; `node scripts/ai-vrstva/jsonld.js --variant A --out …` vygeneruje srovnávací variantu s `Product`.
- **Konvence se S6 (#34):** odkazy na firmu a web nesou `@type` (holý `{"@id"}` validátor na stránce bez plného popisu hlásí jako chybu); drobečky `Elektro Drapač › Naše produkty / Our products / Unsere Produkte › název` podle S6. Výjimka z `<URL>#<kotva>`: 7 položek na jazyk (výstrče 2, tisk 3, podpora prodeje 2) nemá vlastní kotvu, mají `@id` `<URL>#<klíč>` a `url` stránky.
- **Zápis nativně** přes `bulk_update_pages_schema_markup` (CS bez `localeId`, EN/DE s ním). Jazyk bez vlastního zápisu zdědí češtinu. Starý blok `Organization` z head custom code pylonů a 3D nápisů smazán (custom code obsahoval jen ten blok).
- **`llms.txt`** přes API jen pro Enterprise (site Enterprise není). Nativně: Site settings → SEO → LLMs.txt → Upload file. Soubor generuje `scripts/ai-vrstva/llms.js`.
- **Co vrstva nepřebírá:** tvrzení o firmě (rekordy, „jedni z mála“), superlativy a srovnání, zdravotní a ekologická tvrzení bez čísla, marketingové štítky, krátké body z úvodu stránky, společné bloky o průběhu zakázky a kvalitě, popisky galerií, token `{#YOE#}` (robot bez JS ho vidí nenahrazený). Konkrétní záruky s číslem (např. „až 5 let“) jako vlastnost výrobku zůstávají. Seznam po stránkách je v `vynechano` každého souboru.
## 2026-10-31 · S7 · Data CMS Reference a texty (#36)

- **Alt fotek recenzí jde přes nové textové pole `alt-fotky`, ne přes alt v obrázkovém poli.** Zápis `obrazek.alt` do sekundárního locale vyžaduje i `url` a Webflow pak obrázek nahraje znovu jako nový soubor jen pro ten jazyk. Obrázek se tím od češtiny odpojí (ověřeno na Schobeli EN, obsah souboru stejný). Textové pole se píše bez vedlejších účinků. Alt obrázku na homepage i v Referencích je od 31. 10. navázaný na `alt-fotky` přes API (`set_settings`, klíč `altText`, vazba na pole CMS), čte se zpátky a platí ve všech třech jazycích (#46).
- **Fotky v pásu jsou zmenšené kopie 1000 px WebP** (31. 10., úkol K02). Webflow u CMS obrázků na homepage `srcset` neposílá a nastavení v Designeru to neřeší (původní předpoklad S7 byl mylný). Obrázek v CMS je lokalizovaný, zapisuje se do CS, EN i DE. Originály zůstávají v Assets, mapování je v `docs/s7-fotky-zmenseni.md`. 5,11 → 0,99 MB (PR #50).
- **`priorita` v EN/DE se srovnává s češtinou.** Pole je lokalizované a rozdíl dělal jiné pořadí pásu v jazycích.
- **Citace se překládají věrně, jméno firmy podle glosáře** („Elektro Drapač“ i tam, kde zákazník psal „ELEKTRO DRAPAČ“ nebo „Elektrodrapač“). SAGASSER má originál v němčině, DE se nepřekládá.
- **Do primárního locale se psalo jen nové pole `alt-fotky`** a meta description Kariéry a Reference (dřív prázdné). Chyby v českých datech (`Kostel krista krále`, `specialista` malým, mezery na konci jmen, `Assistent`) zůstávají na Lukášovi.

## 2026-10-31 · S6 · Strukturovaná data (#34)

- **Zápis nativně ve Webflow**, schema markup stránky (`bulk_update_pages_schema_markup`), každý jazyk zvlášť. Vypíše se v `<head>` surového HTML, takže ho čtou i roboti bez JS. Locale bez vlastního zápisu dědí češtinu, proto se zapisují vždy CS, EN i DE. Žádný JS v bundlu.
- **Zdroj pravdy je repo:** `data/strukturovana-data/firma.json` a `stranky.json`. Skript `scripts/strukturovana-data.js` staví grafy do `vystup/` a hlídá je v `npm run check` (konvence `@id`, kanonické URL, drobečky, zakázané typy, výřez slovníku schema.org). `--live <url>` porovná vypsaný JSON-LD s výstupem.
- **Články Inspirace:** šablona CMS má `BlogPosting` s vazbami na pole (`name`, `perex`, `hlavni-obrazek`, `datum`, `updated-on`, `slug`). Nové články dostanou data samy, i v EN a DE. Autor a vydavatel je firma, protože web autora u článku nezobrazuje. `datePublished` = pole Datum (ukazuje ho výpis článků), `dateModified` = poslední úprava (ukazuje ji detail článku).
- **Firma je popsaná jen na homepage** (`Organization` + `LocalBusiness`, `@id https://www.eldr.cz/#organization`), jinde jen odkaz. Výjimka: u článku má `author` a `publisher` jméno a URL firmy, protože Google odkaz na uzel z jiné stránky nerozbalí.
- **Kariéra bez `JobPosting`:** pozice jsou zveřejněné 28.–29. 5. 2025 bez data konce a nevíme, jestli jsou aktuální. Google za prošlé inzeráty penalizuje. Popis pozice je navíc rich text, jehož HTML by vazba do JSON nevložila bezpečně. Stránky mají `WebPage` a drobečky. Až Lukáš potvrdí aktuálnost, dá se `JobPosting` doplnit.
- **Záměrně vynecháno:** `Review` a `AggregateRating` z recenzí na vlastním webu (Google je bere jako self-serving a nezobrazí je), ceny a `Offer` (web je neuvádí), `SearchAction` (web nemá vyhledávání), `foundingDate` (web uvádí 1989 i 1990, ARES 1997), `geo` (souřadnice web neuvádí), konkrétní podtyp `LocalBusiness` (web žádný nedokládá).
- **Názvy v drobečcích** jsou titulky stránek bez značky („Naše produkty“, „Kontakty“…), první položka „Elektro Drapač“. K `/produkty` nevede v navigaci přímý odkaz (rozbalovací položka se jmenuje „Naše nabídka / Our Products / Unser Angebot“), proto titulek. Názvy poslány S5 #35 ke sjednocení.
- **Pronájem plošin EN/DE** podle položky v menu webu („Rental of work platforms“ / „Vermietung von Arbeitsbühnen“). Nadpis sekce na stránce má chybný překlad („Rental of rigs“ / „Vermietung von Bohranlagen“ = vrtné soupravy), to je textová vada mimo S6.
- **Otevřené hypotézy z kontroly (neověřeno):** (1) jestli Webflow při dosazení vazby CMS escapuje rovnou uvozovku `"` v názvu nebo perexu; dnešní texty ji nemají, `npm run data:live` po publikaci by rozbitý JSON odhalil. (2) `dateModified` = systémové `updated-on` se mění i při překladu nebo úpravě SEO; odpovídá ale datu, které detail článku ukazuje. (3) Služby na servisu mají jen `url` stránky, kotvy kromě `#pronajem-plosin` na stránce nejsou.
- **Rich Results Test se automatizovat nepodařil** (v headless prohlížeči zůstane tlačítko neaktivní, obcházet kontrolu robotů nebudeme). Náhrada: validátor schema.org 0 chyb na 60 URL + kontrola povinných polí Googlu ve skriptu. Ruční test z odkazů v Google Docu po publikaci (R2 #37).
- Starý `LocalBusiness` v custom code stránek `/`, `/kontakty` a `/servisni-sluzby-a-pronajem-plosin` odstraněn, záloha v `_backup/webflow/custom-code/page-head-localbusiness-do-2026-10-30.html`.

## 2026-10-30 · Lukáš (přes K01) · Výběr varianty recenzí

- Na homepage jde varianta A. Skript patří do bundlu. Data v CMS Reference (překlady, obrázky) se řeší později samostatně. Render u dkLAB zatím zůstává. `/dev/recenze` po přesunu do draftu. (#26)
- Na homepage zůstaly původní prvky nadpisu „Řekli o nás“ a tlačítka „Všechny reference“, jen se přesunuly. Proto se zachovaly překlady EN/DE i GTM hook `.button--primary`. Kopie pásu pro smyčku je jen z `div`, takže AI nevidí recenze dvakrát jako `h3`/`blockquote`. (#26)
- Bundle se servíruje z Cloudflare workeru, který se z repa nenasazuje. Dokud se worker nenasadí, homepage načítá kopii modulu z jsDelivr (připnutý merge commit) a pojistka `data-marquee-ready` brání dvojímu spuštění. (#26, PR #31)

## 2026-10-30 · Lukáš (přes K01) a S3 · Sekce recenzí

- Varianta A „vypadá moc dobře“, zůstává beze změny. Na stejnou dev stránku přibyly varianty B a C ke srovnání. (#26)
- Při hoveru se pás plynule zpomalí a po odjetí rozjede, u všech variant. IX3 umí jen play/pause, ne plynulou změnu rychlosti, a pauza přes IX3 hover nezabrala. Proto JS: `src/dev/testimonial-marquee.js`, mimo bundle, načtený jen v custom code `/dev/recenze` (připnutý merge commit). Po schválení do `src/modules/`. (#26, PR #27)
- Pás bez JS a při `prefers-reduced-motion` stojí a jde posouvat ručně (`overflow-x: auto` na `.testimonial21_marquee`), aby byly dostupné všechny recenze. (#26)
- Oříznutí citací na N řádků je v embedu v sekci: Webflow API nepřijme `-webkit-line-clamp` ani `-webkit-box-orient`. Pojistka `max-height` je na třídě. (#26)

## 2026-10-27 · Lukáš · Přílohy a rozcestník

- Přílohy ve formuláři: varianta vzhledu 1, doručení odkazem v e-mailu. Nativní Webflow upload v komponentě `Form__Basic`, ne výměna za dev kopii (zachová překlady, notifikace a historii). 10 MB na soubor, 5 souborů. (#17)
- Rozcestník pod hero: max šířka sloupce = šířka při 3 sloupcích, 2 sloupce užší a na střed. Kombo třída `layout400_row.two` ve Webflow, ne kód. (#16)
- Publikovat všechny produktové stránky včetně Orientačních systémů a Světelných panelů v novém vzhledu. (#16)

## 2026-10-27 · K01 · Štafeta na ELDR

- Paměť štafety je v `docs/` (roadmap, pipeline, decisions, koordinator).
- Lane jsou oblasti webu, ne kódu, protože Webflow nemá větve ani zámky.
- Publikaci produkce dělá jedno samostatné issue `L` po obou webových
  lane, protože Webflow publikuje celý web najednou.
