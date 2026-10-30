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

1. Kroky jen v Designeru ze seznamů v #16 a #17 (blokující: odkazy dlaždic na `/produkty`, názvy polí příloh, přístup k nahraným souborům).
2. Pokyn k publikaci produkce (L1).
3. Rozpor: `CLAUDE.md` popisuje bundle z jsDelivr, web ho bere z Cloudflare workeru, jehož nasazení v repu není. Doplnit postup do `CLAUDE.md`.
