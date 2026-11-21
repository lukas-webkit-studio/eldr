# Roadmapa ELDR

Zdroj pravdy o úkolech, cenách a termínech je dashboard (projekt
`elektro-drapac`). Tady je jen stav štafety, aby ho session měla v repu.

## Stav

Aktualizováno 20. 11. 2026 odpoledne (S13 #69; S12 #66; S11 #62; předtím S10 #59, S9 #54; předtím 3. 11. koordinátor K02, předání K03). Časy v Europe/Prague.

- **Webflow:** produkce publikována **3. 11. 2026 09:51** (obě domény). Od 31. 10. přibylo jen: nadpis „Řekli o nás“ na homepage na středu (třída `testimonial21_header`) a tučné maximální výšky plošin na `/servisni-sluzby-a-pronajem-plosin` (CS/EN/DE, přání Myšky z 2. 11.).
- **Dodávka 3. 11. odeslaná** Myškovi (e-mail 3. 11.). Faktura **28 200 Kč** po jeho kontrole (dashboard `460218ce`): formulář 6 500, strukturovaná data 4 500, popis produktů pro AI 12 500, recenze 2 500, blog 2 200. Úkoly dodávky jsou v dashboardu `done`.
- **Blog:** 5 článků a 5 bannerů v CMS jako draft, čeká na obrázky od klienta (dashboard `e9fc3f7f`).
- **Zbývá z října:** ruční kroky Lukáše (`cb1f8f9e`: Rich Results Test na 7 URL, výsledek do Docu 01; Make S4 #29), Designer drobnosti (`d30a2c84`), Cloudflare worker (`6d765415`), korektura překladů (`2474d5db`), EN text CTA (`bc1ab14c`).

### Štafeta 20. 11. – S13 #69 měření kliků na horní pruh

- **Hotovo na stagingu (publikováno 20. 11. 15:01:18, footer pin `d86049a2…`, PR #70), produkce nepublikovaná** (domény dál 19. 11. 09:14:46). Ověření s merge commitem 44/44 (`scripts/overeni/s13-mereni-pruhu.js`, snímky `docs/snimky/s13/`).
- **Odkaz pruhu** `/kontakty?pruh=zima-2026#formular` (i `/en`, `/de`), bez UTM. V GA4 jde číslo najít už teď (`page_location` obsahuje `pruh=zima-2026`).
- **Klik pushne** `announcement_click` s `announcement` a `locale` do `dataLayer`. Bez GTM nic nespadne. Postup pro GTM a GA4 v `docs/decisions.md` (S13).
- **Na Lukášovi:** po získání přístupu do GTM nastavit trigger a tag podle `docs/decisions.md` a ověřit, jak container zachází se souhlasem s cookies.

### Štafeta 20. 11. – S12 #66 horní pruh, 2. kolo

- **Hotovo na stagingu (publikováno 20. 11. 14:43:00, footer pin `29f58620…`, PR #67), produkce nepublikovaná** (domény dál 19. 11. 09:14:46). Ověření s merge commitem 143/143, po úpravě mobilu 21. 11. 156/156 (i po opravě 360 px).
- **Rozhodnutí Lukáše během práce:** jedna zpráva bez rotace, „Objednejte do 31. 12. a zamkněte si letošní ceny“ + „Zamluvit termín“, desktop i mobil. EN „Order by 31 Dec and lock in this year’s prices“, DE „Bestellen Sie bis 31.12. zu diesjährigen Preisen“ (kratší, ať se vejdou na mobil).
- **Webflow:** výzva jako ghost tlačítko (obrys, hover bílá/červená), mobil zpráva + tlačítko pod ní, 56 px, křížek u prvního řádku, `text-wrap: balance`, tablet mezera 12 px, `body` záloha 46/44/56 px.
- **Repo:** pruh při scrollu odjede (posun navbaru transformem, layout shift 0), zavření v `localStorage`, rotace umí víc sad zpráv. Ověření `scripts/overeni/s12-horni-pruh.js`, snímky `docs/snimky/s12/`.
- **21. 11. podle náhledu Lukáše:** mobil v jednom řádku (puntík, zpráva, šipka, křížek), 44 px, od 375 px jeden řádek. Puntík pulzuje (IX3 nativně, ne při reduced motion).
- **Na Lukášovi:** odsouhlasit text s klientem, pak souhlas s publikací produkce. Ostatní body z S11 platí.

### Štafeta 20. 11. – S11 #62 horní pruh s akcí „zimní objednávky“

- **Hotovo na stagingu, produkce nepublikovaná.** Domény produkce zůstaly na 19. 11. 2026 09:14:46 (obě). Staging publikován naposledy 20. 11. 07:56:52 (S12 pak 14:43:00).
- **Webflow (nativně):** pruh je první potomek komponenty `Navbar_2024-12`, třídy `announcement_*`, barvy z proměnných. Rotace 4 zpráv, výzva „Zamluvit termín →“, odkaz typu stránka na Kontakty (kotvu `#formular` doplní modul). Po kontrole Lukáše: všechen text bíle (kontrast 5,7 : 1), zvýraznění tučně, žlutá jen jako tečka (na mobilu skrytá), na mobilu celá výzva pod zprávou, pruh 77 px. Texty EN/DE lokalizací komponenty, popisek křížku jako překládaný skrytý text. `.navbar_component` má `flex-direction: column`, `body` `padding-top` 44 px (mobil 77 px) jako záloha bez JS, `.sectionform` `scroll-margin-top` (formulář pod vyšší navigací). Zdůvodnění v `docs/decisions.md` (20. 11.).
- **Repo (PR #63, #64, merge commit `0ddfdcb`):** modul `46-announcement-bar.js` a dočasná kopie `src/dev/announcement-bar.js` v site footeru (jsDelivr, pin `0ddfdcbb175789fead6044010a52362d741d349b`, čteno zpátky). Rotace po 5 s, pauza při hoveru (myš, pero) a fokusu, reduced motion bez pohybu, zavření do konce relace, konec akce po 31. 12. 2026 23:59, odsazení `body` podle změřené výšky. Smoke test 261 kontrol.
- **Ověření na stagingu** (`scripts/overeni/s11-horni-pruh.js`, Chromium): 146/146. Texty CS/EN/DE, 1 řádek na 1440 a 991, na 390 zpráva nejvýš 2 řádky + výzva, křížek 44 × 44 nepřekrývá text, obsah nepřekrytý na 5 stránkách a po zavření se vrátí o výšku pruhu, zavření drží v relaci, rotace a pauzy, reduced motion, konec akce (podvržené hodiny), bez JS první zpráva a odkaz, klik vede na `/…/kontakty#formular` a nadpis formuláře je pod navigací ve 3 jazycích, head s `GTM-W6PR2VX` a 5 Finsweet. Snímky a `vysledky.json` v `docs/snimky/s11/`.
- **Kontrola u dvou stolů:** kód bez vážných nálezů (zapracováno: konec akce i za běhu, hover jen z myši, pevnější testy). Zadání: bez blockeru; opraveny DE formulace a EN zpráva 4, šipka skrytá před čtečkou, kontrast vyřešen úpravou výše.
- **Na Lukášovi:** souhlas s publikací produkce (odejde i s tím vše rozdělané ve Webflow). Po nasazení workeru smazat řádek pruhu ze site footeru i `src/dev/announcement-bar.js`. Až akce skončí a pruh se z navbaru smaže, smazat i `padding-top` na `body` (a `flex-direction` na navbaru může zůstat). GTM: klik na pruh má hook `data-gtm="announcement-zima-2026"`, trigger v containeru zatím není.

### Štafeta 16. 11. večer – S10 #59 pás recenzí: touchpad, kolečko, šipky

- **Hotovo na stagingu, čeká na zkoušku Lukáše na Macu. Produkce se nepublikuje bez jeho souhlasu.**
- **Co přibylo (PR #60, merge commit `3b7debd`):** vodorovné gesto dvěma prsty na touchpadu, vodorovné kolečko a Shift + kolečko posouvají pás, stránka přitom stojí. Svislé gesto scrolluje stránku. Osa se zamyká na celé gesto. Šipky vlevo a vpravo posunou pás o jednu kartu a fokus jde s ní. Vzhled beze změny, ve Webflow se nezměnil žádný styl.
- **Webflow:** v patičce custom code homepage vyměněn jen hash → `3b7debd084d84c5a5c9614feb3a0f701cd7f8657`, čteno zpátky. Staging publikován 16. 11. 22:22:14 (`lastPublished` webu se pohnul, obě domény produkce zůstaly na 16. 11. 21:50:54). **Produkce dál načítá `7ea2076…`** (pás z #54: tah myší a prstem, bez touchpadu). Příští publikace produkce pustí ven i tuhle změnu.
- **Ověření na stagingu** (Chromium): `scripts/overeni/s10-pas-wheel.js` 53/53, regrese #54 `s9-pas-recenzi.js` 61/61, smoke test 197 kontrol. Wheel +300 px posune pás o 300 px, `scrollX` i `scrollY` beze změny, všechny události `defaultPrevented`. Po gestu 0,9 s klid, pak náběh −1 → −9 → −16 → … → −40 px/s, největší změna mezi okny 8 px/s. V head `GTM-W6PR2VX` a 5 Finsweet, 22/22 recenzí v HTML ve 3 jazycích. Snímky a `vysledky.json` v `docs/snimky/s10/`.
- **Na Lukášovi (Mac, Safari a Chrome na stagingu):** tah dvěma prsty do strany nad pásem nesmí spustit zpět/vpřed; dojezd touchpadu má působit přirozeně; svislý scroll přes pás nesmí drhnout. Z cloudu to ověřit nejde, Playwright posílá wheel jako kolečko myši. Pak souhlas s publikací produkce.
- **K rozhodnutí:** kurzor při gestu leží nad pásem, takže pás po gestu stojí, dokud kurzor neodjede (hover má přednost, stejně jako po tahu myší z #54).

### Štafeta 16. 11. – S9 #54 pás recenzí: tah myší a prstem

- **Na produkci od 16. 11. 21:50 (pin `7ea2076`, publikoval koordinátor).** Odstavce níž popisují stav před publikací.
- **Dopoledne (PR #55, #56):** tah myší a prstem, setrvačnost, potlačení kliku. Lukáš na telefonu vrátil: není to plynulé a tah jde jen „perfektně rovně do strany“.
- **Oprava odpoledne (PR #57, merge commit `7ea2076`):** o směru gesta rozhoduje modul (do 45° tah, drží až do puštění; strmější pohyb scrolluje stránku). Dotyk a pero jdou přes Touch Events s nepasivním `touchmove`. Po hození pás nezastavuje, rychlost přechází rovnou do −40 px/s. Pauza 1 s jen po puštění bez hození. Vzhled beze změny, ve Webflow se nezměnil žádný styl.
- **Webflow:** v patičce custom code homepage vyměněn jen hash → `7ea2076fb17a824e71d9ded33569846865f1fb91`, čteno zpátky. Staging publikován 16. 11. 15:43:27 (`lastPublished` webu se pohnul, domény produkce zůstaly na 15. 11. 23:40:19). **Produkce dál načítá `c76921a…`**, tedy pás bez tahu.
- **Ověření na stagingu** (`scripts/overeni/s9-pas-recenzi.js`, Chromium): 61/61. Tah pod 30° a 40° posune pás 1 : 1 a stránka se nehne, pod 60° scrolluje stránka. Tah s 80 px svislého úletu drží. Hození doleva po 100 ms: −610 → −507 → −422 → −353 → … → −40 px/s, nejpomalejší okno 40 px/s. Snímky se zpomaleným CPU 4×: medián 16,7 ms; nad 20 ms 1 z 86 při tahu (83 ms), 1 z 150 při dojezdu (33 ms), 0 z 121 při běžném chodu. V head `GTM-W6PR2VX` a 5 Finsweet, 22/22 recenzí v HTML. Smoke test 152 kontrol. Snímky a `vysledky.json` v `docs/snimky/s9/`.
- **Na Lukášovi:** vyzkoušet na telefonu šikmý tah a hození. iOS Safari odsud ověřit nejde. Pak souhlas s publikací produkce. Rozhodnout: kurzor `grab` i nad kartami; po hození myší pás pod kurzorem zastaví (hover má přednost).
- Po nasazení Cloudflare workeru dál platí: smazat řádek z custom code homepage i `src/dev/`.

### Plán na listopad (K03)

1. **Přesun GitHubu pod organizaci klienta `eldr`** (`63f703f1`, čeká na klienta: pošleme návod, pak založí organizaci).
2. **Hned potom skill pro překlady** (`d30f9ece`, 4 500 Kč, termín 30. 11.). Skilly `preklad` a `preklad-podklady` v `.claude/skills/` jsou základ.
3. **Projekt 3D konfigurátor** (MVP `6ad1d4ff`, 60 000 Kč; schůzka a příkladové otázky `d505d416`).
4. Další: analýza viditelnosti v AI (`2a74fc63`, čeká na klienta), přílohy z formuláře přes Make na Drive (`9499733a`), produktová stránka 3D tisku (backlog).

V dashboardu zatím není etapa 2026/11, úkoly listopadu jsou v etapě 2026/10 nebo bez etapy.

### Štafeta 2. 11. večer – S8 #38 blog

- **5 článků od klienta v CMS Inspirace jako draft**, CS/EN/DE, bez obrázků, nepublikováno. Bannery: 5 nových malých bannerů (draft, bez obrázku, CS/EN/DE), token `[banner:…]` na místě tučné výzvy na konci článku. Čteno zpátky 30/30 variant shodně se zdrojem.
- SEO: šablona bere title `ELDR 💡 {name}` a meta description z `perex`, proto `perex` = meta description ze zdroje (≤160 znaků), první odstavec je úvod v textu. Datum nevyplněno (není povinné).
- Google Docs pro korektorku: 15 (5 × CS/EN/DE) ve složce 04 Blog. EN a DE nezávisle zkontrolované.
- Na Lukášovi: obrázky (hlavní, náhledový, banner volitelně), datum, publikace (spolu s bannery, jinak token v článku zmizí), rozhodnutí k „Víc je méně“ a „roce 2027“ v titulku.

### Štafeta noc 30.–31. 10.

- **R2 #37 nezávislá kontrola a důkazy z produkce:** fáze A (staging) verdikt „k publikaci ANO“, O1 opraveno před publikací (PR #44). Produkce 31. 10. 01:11:42: 90 URL × 7 robotů 630/630, validator.schema.org 90/90 bez chyb a varování, 1 blok JSON-LD na každé URL, head s `GTM-W6PR2VX` a 5 Finsweet. Důkaz `docs/overeni-r2-produkce.md`, snímky `docs/snimky/r2/`. Google Docs: 01 přehled stránek doplněný o výsledky z produkce a 7 vzorových URL pro ruční Rich Results Test, 02 „výsledky z produkce“, „00 Přehled dodávky“ v kořeni složky. Na Lukášovi: Rich Results Test na 7 URL (z cloudu nejde), `llms.txt`, datum článků v šabloně Inspirace (ukazuje „Updated On“), skrytá sekce LED obrazovky, tlačítko „Kompletní nabídka“ česky na `/en` a `/de`.
- **S7 #36 recenze a texty (staging):** 22 recenzí v CMS Reference přeloženo znovu do EN/DE (věrně, podle glosáře, kontrola u dvou stolů), Polytex EN doplněn přes API, pořadí srovnané s CS, nové pole `alt-fotky` ve třech jazycích. Na `/`, `/en`, `/de` 22/22 recenzí s textem, jménem a fotkou v HTML bez JS. Mimo recenze: Servis EN/DE (pracovní plošiny), O nás EN (m², úvod), Muzeum SEO EN/DE, meta description Kariéra a Reference ve 3 jazycích, názvy pozic EN/DE, perexy 3 článků, JSON-LD. Staging 31. 10. 00:29, produkce nepublikovaná. Tabulka před/po: `docs/s7-recenze-preklady.md`. Na Lukášovi: Designer (alt a `srcset` obrázků v pásu), fotka dkLAB, fotka Studio REMA (nápis CLARIOS), české chyby v CMS.
- **S6 #34 strukturovaná data (staging):** JSON-LD na 20 stránkách × CS/EN/DE = 60 URL, nativně ve Webflow (schema markup stránky). Zdroj a kontrola v `data/strukturovana-data/` a `npm run data` / `npm run data:live`. Články Inspirace a pozice v Kariéře z vazeb na CMS, nové články automaticky. Starý `LocalBusiness` z custom code tří stránek pryč. Validátor schema.org 0 chyb na 60 URL. Produkci publikuje koordinátor po R2 #37; Rich Results Test na produkci doplní R2.

### Produkce 30. 10. 2026 22:56

Publikováno a ověřeno: 10 produktových stránek CS/EN/DE, menu, přílohy ve formuláři (`Příloha 1–5`), recenze (varianta A) na homepage, SEO a `noindex` oprava, testovací článek pryč. L1 #19 zavřené.

**Otevřené:**
- S4 #29: zápis e-mailu zákazníkovi do Make 2867189 (Lukáš povolil v #29 21:48). Po zápisu testovací odeslání.
- ~~Schválené do 3. 11.: strukturovaná data, popis produktů pro AI~~ hotovo 31. 10. (S6, S5). Blog 2 500 Kč (`9c9a80c9`) čeká na články od klienta (S8 #38).
- Skill pro překlady (`d30f9ece`) až s přesunem GitHubu pod org `eldr`.
- Cloudflare worker: nasazení z repa, pak smazat kopii marquee z custom code homepage a `src/dev/`. `CLAUDE.md` opravené 31. 10.
- CMS Reference: překlady a Polytex EN hotové 31. 10. (S7 #36). Zbývá fotka dkLAB a Studio REMA od klienta.
- Designer drobnosti po publikaci (úkol `d30a2c84`).

### Štafeta 31. 10. – S5 #35 popis produktů pro AI

- **Hotovo na stagingu, produkci publikuje koordinátor po R2.** JSON-LD na 30 URL (10 produktových stránek × CS/EN/DE), nativní schema markup ve Webflow, čteno zpátky 30/30. Starý `Organization` z head custom code pylonů a 3D nápisů smazán.
- 44 výrobků a služeb na jazyk, 315/314/316 údajů s odkazem na zdroj, 3 otázky s odpovědí. Test dohledatelnosti 1 604/1 604 citací v `npm run check`.
- Staging 31. 10. 00:42: 210/210 kontrol robotů (7 User-Agentů × 30 URL), validator.schema.org 30/30 bez chyb a varování, snímky před a po shodné. Výstup `docs/overeni-s5-staging.md`.
- Model `Service` místo `Product` (Google u produktu bez ceny hlásí chybu). Rich Results Test z cloudu nejde, je v „Na Lukášovi“.
- `llms.txt` připravený v repu, nahrání jen ručně (Na Lukášovi).
- Google Docs pro klienta ve složce 02 (30 + 2).

### Štafeta 30. 10.

- **S3 #26 hotovo, na homepage:** Lukáš vybral variantu A. Sekce recenzí na homepage (CS/EN/DE) je nahrazená pásem z CMS Reference: 22 recenzí v HTML, plynulé zpomalení při hoveru, reduced motion bez posunu. Nadpis a tlačítko „Všechny reference“ jsou původní prvky, takže zůstaly překlady i GTM. Staging 30. 10., produkci publikuje koordinátor. `/dev/recenze` je v draftu.
- **Nasazení workeru:** modul `45-testimonial-marquee.js` je v bundlu (PR #31), ale Cloudflare worker `eldr-web` se z repa nenasazuje sám (poslední deploy 21. 10.). Homepage zatím načítá kopii `src/dev/testimonial-marquee.js` z custom code stránky. Po nasazení workeru řádek z homepage i soubor `src/dev/` smazat.
- Nalezeno mimo rozsah S3 (CMS Reference): chybný strojový překlad EN/DE u více položek, Polytex bez EN, dkLAB má AI render místo fotky realizace, obrázky až 4000 px bez zmenšení. Lukáš: řešit později samostatně. Seznam je v #26.

### Štafeta 27. 10. večer

- **H1 #16 hotovo** (PR #22): 10 produktových stránek na `/produkty/…` v novém vzhledu, CS/EN/DE, navbar přepojený, rozcestník se 2 sloupci užší a na střed. Staging 27. 10. 16:36.
- **S1 #17 hotovo** (PR #21): přílohy v produkčním formuláři `Form__Basic`, 5 polí, 10 MB na soubor, odkaz v e-mailu (nativní notifikace Webflow).
- **R1 #18 hotovo:** verdikt „k publikaci NE“, blokovaly B1–B4.
- **H2 #24 hotovo:** přes API opraveno B1 (obě stránky indexované, v sitemap), B4, P1, P4, P5 a drobnosti z kontroly v bloku adresy na Kontaktech (EN/DE). Staging 27. 10. 18:39. Zbývá Designer: B2 (dlaždice `/produkty` → 404), B3 (názvy polí příloh).
- **L1 #19:** publikace produkce na pokyn Lukáše, plán 28. 10.
- Testovací článek `/inspirace/test-…` je jen na produkci, z CMS je smazaný. Zmizí při publikaci, ověřit v L1.

### Schváleno klientem, termín pondělí 2. 11. 2026

Po kontrole klientem jde faktura.

| Úkol v dashboardu | Cena | Session | Stav |
|---|---|---|---|
| Nahrávání souborů v kontaktním formuláři (`21382a7d`) | 6 500 Kč | S1 | čeká na rozhodnutí |
| Publikace nových produktových stránek a překladů (`581fd691`) | – | R1 → H1 → L1 | návrh |
| Skill pro překlady textů (`d30f9ece`) | 4 500 Kč | S2 | čeká na rozhodnutí |

### Čeká na schválení klientem — nespouštět

Spouští se, až Lukáš potvrdí, že klient schválil.

| Úkol | Návrh ceny | Poznámka |
|---|---|---|
| JSON-LD strukturovaná data na všech stránkách (`85a630b6`) | 4 500 Kč | |
| Struktura produktových stránek pro AI (`5dbfd455`) | 9 500 Kč | navazuje na publikované produktové stránky |
| Sekce recenzí na homepage, Relume testimonial21 (`97c16e19`) | 2 500 Kč | hotovo 30. 10. (S3 #26), varianta A na homepage, staging |
| Další články v blogu (`9c9a80c9`) | nahrání 1 000 Kč, překlad 600 Kč/článek | na webu je 8 článků, všechny už v CS/EN/DE |
| Analýza viditelnosti v AI (`2a74fc63`) | 12 000 Kč | stojí, klient ověřuje agenturu |
| MVP konfigurátor (`d505d416`, `6ad1d4ff`) | 60 000 Kč | samostatná schůzka, zatím příkladové otázky |

### Mimo štafetu, ale otevřené

- Zapracovat korekturu překladů EN a DE (`2474d5db`), termín byl 23. 10.
- Zkrátit EN text CTA „Request a no-obligation quote“ (`bc1ab14c`).
- Přesun skriptů webu na Cloudflare (`6d765415`).
- Produktová stránka 3D tisku (`5f5c3879`), backlog.

## Na Lukášovi

1. Designer drobnosti po publikaci (dashboard `d30a2c84`).
2. Přístup k Cloudflare workeru `eldr-web` nebo postup nasazení.
3. ~~Rozpor `CLAUDE.md` × Cloudflare worker~~ opraveno 31. 10. (K02). Postup nasazení workeru do repa pořád chybí (bod 2).
4. **S5 #35 – nahrát `llms.txt`:** Webflow → Site settings → SEO → LLMs.txt → Upload file → soubor `data/ai-vrstva/llms.txt` z repa → Save changes → publikovat. Ověřit `https://www.eldr.cz/llms.txt`. Přes API to jde jen na tarifu Enterprise.
5. **Rich Results Test ručně na 7 vzorových URL** (z cloudu nejde): seznam s odkazy „Otestovat“ v Google Docu „Strukturovaná data – přehled stránek“ (složka 01), výsledek do posledního sloupce. Čeká se 0 chyb.
6. **S5 #35 – rozhodnout o textech na webu** (vrstva je přebírá doslova nebo je vynechala): štítek „1–40 m výška“ na zámečnických konstrukcích, karta „Neonové nápisy & imitace“ (plastové pásky × sklo), H1 svítidel „Neonová a LED neonová…“, profil 9 interiér × exteriér, „záložny (klíč)“ u výstrčí, procesní blok „světelné reklamy“ na stránce tisku, překlepy „uspůsobit“, „zavešení“. Seznam s odkazy je v `data/ai-vrstva/_overeni/`.
7. **S5 #35 – web bez JavaScriptu:** `src/eldr.css` skrývá `.localization-show-only_*` (`display:none`), dokud JS nepřidá třídu jazyka. Robot bez JS proto v češtině nevidí část fotek výrobků. Token `{#YOE#}` vidí nenahrazený. Řešení patří do Webflow (nativní lokalizace prvků).
8. **Před odesláním e-mailu Myškovi** (koncept v Gmailu, vlákno „Shrnutí callu…“): nasdílet složku `ELDR/Dodávka 2026-11-03` na `myska@eldr.cz`, nahrát `llms.txt` (bod 4), spustit Rich Results Test (bod 5).
9. **Make S4 #29:** import blueprintu `_backup/make/2867189-2026-10-30-navrh-s4.json` do scénáře 2867189, pak testovací odeslání. K 31. 10. 04:20 neproběhlo (`lastEdit` 27. 8.).
10. **Designer:** datum v šabloně Inspirace navázat na pole Datum (3 články ukazují 30.10.2026), alt a `srcset` v pásu recenzí, „Kompletní nabídka“ česky na `/en` a `/de`.
11. **Otázky:** rok založení (web 1989 i 1990, ARES 1997); aktuálnost a e-mail pozic v Kariéře; skrytá sekce LED obrazovky; nabídnout korekturu textů webu (interní seznam v #35).
