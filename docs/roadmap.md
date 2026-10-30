# Roadmapa ELDR

Zdroj pravdy o úkolech, cenách a termínech je dashboard (projekt
`elektro-drapac`). Tady je jen stav štafety, aby ho session měla v repu.

## Stav

Aktualizováno 27. 10. 2026 (koordinátor K01). Časy v Europe/Prague.

- **Webflow:** staging publikován 27. 10. 14:10, poslední změna v Designeru
  27. 10. 14:39. **Produkce** naposled publikována **14. 9. 2026 11:27**.
- 27. 10. opravena třída `Button--Primary` (`text-align: center`)
  v Designeru, bez publikace produkce.
- Nové produktové stránky jsou na stagingu pod `/produkty/<slug>`, přeložené
  do EN a DE. Otevřené nálezy: `docs/nalezy-dev-stranky.md`.
- Nahrávání příloh běží na testovací stránce `/dev/kontakty-upload`.
- `docs/stav-prekladu.json` popisuje stav k 14. 9., novější publikace
  stagingu v něm nejsou.

### Štafeta noc 30.–31. 10.

- **S7 #36 recenze a texty (staging):** 22 recenzí v CMS Reference přeloženo znovu do EN/DE (věrně, podle glosáře, kontrola u dvou stolů), Polytex EN doplněn přes API, pořadí srovnané s CS, nové pole `alt-fotky` ve třech jazycích. Na `/`, `/en`, `/de` 22/22 recenzí s textem, jménem a fotkou v HTML bez JS. Mimo recenze: Servis EN/DE (pracovní plošiny), O nás EN (m², úvod), Muzeum SEO EN/DE, meta description Kariéra a Reference ve 3 jazycích, názvy pozic EN/DE, perexy 3 článků, JSON-LD. Staging 31. 10. 00:29, produkce nepublikovaná. Tabulka před/po: `docs/s7-recenze-preklady.md`. Na Lukášovi: Designer (alt a `srcset` obrázků v pásu), fotka dkLAB, fotka Studio REMA (nápis CLARIOS), české chyby v CMS.
- **S6 #34 strukturovaná data (staging):** JSON-LD na 20 stránkách × CS/EN/DE = 60 URL, nativně ve Webflow (schema markup stránky). Zdroj a kontrola v `data/strukturovana-data/` a `npm run data` / `npm run data:live`. Články Inspirace a pozice v Kariéře z vazeb na CMS, nové články automaticky. Starý `LocalBusiness` z custom code tří stránek pryč. Validátor schema.org 0 chyb na 60 URL. Produkci publikuje koordinátor po R2 #37; Rich Results Test na produkci doplní R2.

### Produkce 30. 10. 2026 22:56

Publikováno a ověřeno: 10 produktových stránek CS/EN/DE, menu, přílohy ve formuláři (`Příloha 1–5`), recenze (varianta A) na homepage, SEO a `noindex` oprava, testovací článek pryč. L1 #19 zavřené.

**Otevřené:**
- S4 #29: zápis e-mailu zákazníkovi do Make 2867189 (Lukáš povolil v #29 21:48). Po zápisu testovací odeslání.
- Schválené do 3. 11.: strukturovaná data (`85a630b6`), popis produktů pro AI 12 500 Kč (`5dbfd455`), blog 2 500 Kč (`9c9a80c9`, čeká na články od klienta).
- Skill pro překlady (`d30f9ece`) až s přesunem GitHubu pod org `eldr`.
- Cloudflare worker: nasazení z repa, pak smazat kopii marquee z custom code homepage a `src/dev/`; opravit `CLAUDE.md`.
- CMS Reference: překlady, Polytex bez EN, dkLAB render (#26).
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
3. Rozpor: `CLAUDE.md` popisuje bundle z jsDelivr, web ho bere z Cloudflare workeru, jehož nasazení v repu není. Doplnit postup do `CLAUDE.md`.
4. **S5 #35 – nahrát `llms.txt`:** Webflow → Site settings → SEO → LLMs.txt → Upload file → soubor `data/ai-vrstva/llms.txt` z repa → Save changes → publikovat. Ověřit `https://www.eldr.cz/llms.txt`. Přes API to jde jen na tarifu Enterprise.
5. **S5 #35 – Google Rich Results Test ručně** (z cloudu nejde): https://search.google.com/test/rich-results na `https://eldr.webflow.io/produkty/orientacni-systemy` a `https://eldr.webflow.io/produkty/pylony-a-totemy`. Čeká se 0 chyb, detekované jen „Drobečková navigace“ (a u orientačních systémů „Často kladené otázky“). Výsledek zapsat do #35.
6. **S5 #35 – rozhodnout o textech na webu** (vrstva je přebírá doslova nebo je vynechala): štítek „1–40 m výška“ na zámečnických konstrukcích, karta „Neonové nápisy & imitace“ (plastové pásky × sklo), H1 svítidel „Neonová a LED neonová…“, profil 9 interiér × exteriér, „záložny (klíč)“ u výstrčí, procesní blok „světelné reklamy“ na stránce tisku, překlepy „uspůsobit“, „zavešení“. Seznam s odkazy je v `data/ai-vrstva/_overeni/`.
7. **S5 #35 – web bez JavaScriptu:** `src/eldr.css` skrývá `.localization-show-only_*` (`display:none`), dokud JS nepřidá třídu jazyka. Robot bez JS proto v češtině nevidí část fotek výrobků. Token `{#YOE#}` vidí nenahrazený. Řešení patří do Webflow (nativní lokalizace prvků).
