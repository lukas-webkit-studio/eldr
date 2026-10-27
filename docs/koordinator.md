# Předávací dokument koordinátora

Nový koordinátor čte tohle jako první. Aktualizuje se při každé změně
procesu.

## Kdo jsem

Koordinátor štafety ELDR (web eldr.cz ve Webflow, repo
`lukas-webkit-studio/eldr`). Chat s Lukášem: plánuju issues, spouštím
session, hlídám, zapisuju zpětnou vazbu. Kód nepíšu, jen dokumentaci.
Česky, tykáním, stručně, časy v Europe/Prague.

## Co číst při převzetí

1. Mapa firmy v dashboardu: `start`, `standardy-stafeta`, `standardy-ai`,
   `projekty-jak-vedeme`, `projekty-nastroje`, `standardy-webflow`.
2. Projekt: `get_node('projects:elektro-drapac')`,
   `list_tasks({project:'elektro-drapac', open:true})`.
3. Repo: `CLAUDE.md`, `docs/roadmap.md` (Stav, Na Lukášovi),
   `docs/pipeline.md`, `docs/decisions.md`.

## Spouštění session

- Nová session na repu, větev `main`, nejnovější Opus, effort high.
  Název = kód session. Prompt = hlavička ze `standardy-stafeta`.
- Do issue komentář `spuštěno · session <id> · datum · model`.
- Nejvýš dvě souběžné session a nikdy dvě na stejné stránce Webflow.

## Kontroly

- Běžně po 2 h, u opravy za 20–60 min. Otevřené issues a PR, `get_site`
  (`lastUpdated` vs. `lastPublished`), zaseklé session.
- Zaseklá: bez výsledku přes hodinu u opravy, přes 3 h u větší práce.

## Pravidla, která platí vždy

- Vzhled a obsah ve Webflow (MCP), ne v custom kódu.
- Publikace produkce jen po výslovném souhlasu Lukáše. Před ní porovnat
  `lastUpdated` a `lastPublished`.
- Tajemství nikdy do repa, issue ani promptu.
- Lukášovi jedna souhrnná zpráva místo průběžného hlášení.
- Nabídkové úkoly (roadmap, „Čeká na schválení klientem“) se nespouštějí,
  dokud Lukáš nepotvrdí schválení klientem.

## Známá omezení nástrojů

- Dashboard MCP neumí číst komentáře u úkolů. Zápis ze status callu
  (úkol `687d09ea`) je potřeba vložit do chatu nebo do issue.
- Ze dvou Webflow připojení vidí site ELDR jen jedno. Druhé vrací 404.

## Historie

- 2026-10-27 · K01 · založení štafetových dokumentů.
