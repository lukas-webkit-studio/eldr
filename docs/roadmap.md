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

### Schváleno klientem, termín pondělí 3. 11. 2026

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
| Struktura produktových stránek pro AI (`5dbfd455`) | 7 500 Kč | navazuje na publikované produktové stránky |
| Sekce recenzí na homepage, Relume testimonial21 (`97c16e19`) | 1 500 Kč | změna rozvržení = přes návrh |
| Překlad zbylých článků v blogu, cca 26 EN a 29 DE (`9c9a80c9`) | doplní Lukáš | poběží přes skill z S2 |
| Analýza viditelnosti v AI (`2a74fc63`) | 12 000 Kč | stojí, klient ověřuje agenturu |
| MVP konfigurátor (`d505d416`, `6ad1d4ff`) | 60 000 Kč | samostatná schůzka, zatím příkladové otázky |

### Mimo štafetu, ale otevřené

- Zapracovat korekturu překladů EN a DE (`2474d5db`), termín byl 23. 10.
- Zkrátit EN text CTA „Request a no-obligation quote“ (`bc1ab14c`).
- Přesun skriptů webu na Cloudflare (`6d765415`).
- Produktová stránka 3D tisku (`5f5c3879`), backlog.

## Na Lukášovi

1. Varianta vzhledu nahrávání příloh a způsob doručení příloh (S1).
2. Drafty Orientační systémy a Světelné panely v novém vzhledu: publikovat
   s ostatními, nebo nechat v `/dev/`.
3. Zdroj glosáře pro skill po přejmenování repa (S2).
4. Souhlas s publikací produkce (L1).
5. Kroky, které MCP neumí (seznam vznikne v R1 a H1).
