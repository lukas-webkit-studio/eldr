# Štafeta ELDR — protokol, lane, session

Jak se na eldr.cz pracuje v řadě čerstvých session. Principy jsou v uzlu
mapy `standardy-stafeta`, tenhle soubor má před nimi přednost. Pravidla
webu (Webflow vs. kód, nasazení, publikace) jsou v `CLAUDE.md` a platí vždy.

## Adaptér pro Webflow

| Otázka | Odpověď pro ELDR |
|---|---|
| Kde je zdroj pravdy | **Webflow** (site `635940ec249b210e8902edd4`). Repo je doplněk: JS bundle, skilly, dokumentace |
| Jak session zapisuje | Webflow MCP. Vzhled a obsah jen ve Webflow, ne v custom kódu (`CLAUDE.md`) |
| Kde je produkce | Publikovaný web na `www.eldr.cz` a `eldr.cz`. Staging = `eldr.webflow.io` |
| Jak se ověří výsledek | Snímky před a po (desktop, mobil, CS/EN/DE), kontrola odkazů, SEO meta, texty podle glosáře, `lastPublished` u domény |
| Co jde jen přes Lukáše | Souhlas s publikací produkce. Co MCP neumí: interakce IX2, obrázky a cíle odkazů per locale, styly v sekundárním locale, SEO v češtině přes Designer, redirecty podle potřeby |

### Webflow nemá větve ani zámky

- Kdo zapíše přes API jako druhý, přepíše prvního bez varování.
- Publikace pouští ven **celý web**, i cizí rozdělanou práci.
- Proto: lane = oblast webu (stránky, komponenty), ne oblast kódu. Dvě
  souběžné session nesmí sahat na stejnou stránku ani sdílenou komponentu
  (navbar, patička, CTA bloky, formulář).

### Publikace

1. Publikuje se **jen po výslovném souhlasu Lukáše** v issue nebo v chatu
   koordinátora. Session sama produkci nepublikuje, pokud to issue výslovně
   neříká a souhlas není zapsaný.
2. Před publikací `data_sites_tool > get_site`: porovnat `lastUpdated`
   a `lastPublished`. Je-li `lastUpdated` novější a změny nejsou z téhle
   session, nepublikovat a zapsat do issue.
3. Snímky před publikací (produkce), publikace, snímky po.
4. Ověřit, že se pohnul `lastPublished` u domény v `customDomains`.
   `publish_site` vrací jen ozvěnu parametrů, ne výsledek.
5. Po publikaci zkontrolovat v head `GTM-W6PR2VX`, čtyři Finsweet skripty
   a připnutý commit bundlu.

Staging (`eldr.webflow.io`) smí session publikovat sama, pokud tím
neprochází cizí rozdělaná práce (bod 2).

### Webflow MCP v session

Pro site ELDR funguje jen připojení, které site vidí (`get_site` vrátí 404
u druhého). Session si to ověří prvním voláním a v issue napíše, které použila.

## Protokol session (kroky 0–8)

0. **Vstup:** hlavička promptu a číslo issue. Číst `CLAUDE.md`, sekci Stav
   v `docs/roadmap.md`, tenhle soubor a jen potřebné části repa.
1. **Závislosti:** otevřená závislost = komentář „čeká na X“ a konec.
2. **Převzetí:** ověřit, že v lane nic neběží. Stav issue `běží`.
   `get_site` a zapsat `lastUpdated` / `lastPublished` do issue.
3. **Práce:** jen rozsah issue. Změny v repu na větvi z aktuálního `main`.
   Zápis do Webflow ověřit čtením zpátky, ne návratovým kódem.
4. **Brány** (podle toho, čeho se issue dotklo):
   - **Webflow:** snímky před a po (desktop 1440, mobil 390; CS, EN, DE),
     kontrola odkazů (žádné `#` místo cíle, žádné 404), SEO meta ve všech
     locale, texty podle glosáře a pravidel textu, prázdné stavy (galerie,
     „No items found.“).
   - **Repo:** `git merge origin/main`, `npm run check`, code review.
   - **Kontrola u dvou stolů** (skill `kontrola`): proti zadání a proti
     standardům, jiný agent než autor.
5. **PR** (u změn v repu): `Closes #N`, výstupy bran, co zůstalo. Merguje
   session sama po zelených branách. Do Webflow jen merge commit z `main`.
6. **Produkce:** jen pokud to issue říká a souhlas Lukáše je zapsaný
   (viz Publikace). Jinak staging a snímky.
7. **Uzavření:** Stav v `docs/roadmap.md`, rozhodnutí do `docs/decisions.md`,
   komentář `hotovo · PR #N` a seznam toho, co potřebuje Lukáš.
8. **Předání:** spustit další issue v lane, pokud má zavřené závislosti.

Session s Lukášem nemluví. Otázky píše do issue, dokončí, co jde, a nečeká.

## Kódy session

S stavba · D návrh · H oprava · R revize · L drobná úprava pro provoz.

## Lane

| Lane | Oblast | Smí sahat | Nesmí sahat |
|---|---|---|---|
| `formular` | Kontaktní formulář a nahrávání příloh | stránka Kontakty, `/dev/kontakty-upload`, formulář `#form-kontakt`, e-mailová šablona | produktové stránky, navbar, patička |
| `produkty` | Nové produktové stránky a jejich překlady | `/produkty/<slug>`, `/dev/` drafty, SEO stránek, lokalizace těchto stránek | formulář a stránka Kontakty |
| `skill` | Skilly pro překlady a návod pro klienta | `.claude/skills/`, `docs/`, Google Docs | Webflow (jen čtení) |

Sdílené komponenty (navbar, patička, CTA) mění jen lane `produkty`,
a jen když to issue výslovně říká. Publikaci produkce dělá samostatné
issue `L`, které čeká na obě webové lane.

Souběžně běží nejvýš dvě session.

## Tabulka session

| Kód | Název | Lane | Issue | Závisí na | Stav |
|---|---|---|---|---|---|
| R1 | Kontrola produktových stránek před publikací | produkty | – | – | návrh |
| H1 | Opravy z kontroly R1 | produkty | – | R1 | návrh |
| S1 | Nahrávání příloh v produkčním formuláři | formular | – | rozhodnutí Lukáše (varianta, doručení) | návrh |
| S2 | Skill pro překlady: výstup, glosář, návod | skill | – | rozhodnutí Lukáše (zdroj glosáře) | návrh |
| L1 | Publikace produkce a ověření | produkty | – | H1, S1, souhlas Lukáše | návrh |
