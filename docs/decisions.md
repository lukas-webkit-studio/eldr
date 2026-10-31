# Rozhodnutí

Rozhodnutí, která padla během štafety a nejsou v `CLAUDE.md`. Nejnovější
nahoře. Formát: datum · kdo · rozhodnutí · proč · odkaz.

## 2026-10-31 · S3 · Nižší karty recenzí (#46)

- **Obrázek 16:9**, ne 3:2. Na všech 22 fotkách zůstane nápis i logo celé (kontrola středového ořezu). 3:2 by kartu zvedlo o 36 px bez přínosu.
- **Pás 651 → 406 px** na 1440 × 900 (72 % → 45 % okna), mobil 591 → 390 px. Citace 3 řádky místo 6 (embed sekce), menší odsazení a mezery, mezera mezi kartami 1,5 → 1 rem (mobil 0,75 rem).
- **Vlastní třídy `testimonial21_company`, `_name`, `_position`** místo sdílených `SectionReference__Collection__Item__*`. Sdílené třídy platí i na `/reference`, jejich zmenšení by změnilo i tu stránku.
- **Název firmy víc dýchá** (Lukáš 31. 10. 9:10: „o dost lepší, jen nadpis ať trošičku víc dýchá“). +8 px nad názvem, mezi názvem a žlutou linkou a mezi linkou a citací, na mobilu +6 px. Pás 406 → 430 px (1440 × 900), mobil 390 → 408 px. Mezera linka → citace je `margin-top` na `testimonial21_quote`, protože sdílenou třídu linky (`Divider--Left--Yellow--56`) neměníme.
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

- **Alt fotek recenzí jde přes nové textové pole `alt-fotky`, ne přes alt v obrázkovém poli.** Zápis `obrazek.alt` do sekundárního locale vyžaduje i `url` a Webflow pak obrázek nahraje znovu jako nový soubor jen pro ten jazyk. Obrázek se tím od češtiny odpojí (ověřeno na Schobeli EN, obsah souboru stejný). Textové pole se píše bez vedlejších účinků. Na homepage je alt obrázku navázaný na `name`, napojení na `alt-fotky` je krok v Designeru.
- **Fotky v pásu se nezmenšovaly přes API.** Výměna souboru je nevratná a mění obrázek i na `/reference`. Webflow má zmenšené varianty (`-p-500`, `-p-800`) hotové, na `/reference` je posílá v `srcset`, na homepage ne. Zapnutí je nastavení obrázku v Designeru: 5,1 MB → asi 1,8 MB.
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
