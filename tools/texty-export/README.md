# Export textů webu do Google Docs

Skripty, kterými 24. 9. 2026 vznikly dokumenty ve složce
**Google Drive → ELDR → Texty webu 2026-09** (`Produkty/`, `Blog/`,
`Společné prvky/`; jedna stránka = jedna složka, v ní `CS_`, `EN_`, `DE_`).

Zdroj je **publikovaný staging** (`eldr.webflow.io`, `/en/`, `/de/`),
stažený bez JS — tokeny `{#YOE#}` a `[banner:…]` tak zůstávají syrové
a odkazy se berou tak, jak je Webflow lokalizuje (`/en/kontakty#formular`).

- `blocks.py` — projde `<main>` a vrátí listové bloky s textem (h1–h6, p,
  li, tlačítka, štítky) v pořadí dokumentu.
- `extract.py` — přiřadí českým štítkům (`NADPIS H2`, `ODRÁŽKA`, `ŠTÍTEK`,
  `TLAČÍTKO`, `KARTA – POPIS`…) číslo, když se v dokumentu opakují,
  a vyrenderuje HTML, které Drive API převede na Google Doc
  (`contentMimeType: text/html`). Štítek je šedý 8 pt, text 11 pt.

Co se vynechává: fotky a jejich popisky (`swiper-popup--label`), CMS
datumy, „Přečtěte si také", prázdné stavy galerie, widget „Souhrn přes
AI". Sdílené prvky (menu, patička, cookie lišta, Jak probíhá výroba,
Důvěřují nám, Záruka kvality, blogové bannery) jsou jednou ve
`Společné prvky`, ne v každé stránce. Skryté prvky (`.hide`) se
zahrnují bez označení. Pylony mají vlastní variantu „Jak probíhá výroba",
proto ji mají v dokumentu inline.

Hypertextové odkazy v Docs musí být absolutní — relativní `href` si
Google přepíše na `docs.google.com/...`. Proto je odkaz v textu absolutní
na staging a relativní cesta je zvlášť v šedém řádku `odkaz: …`.
