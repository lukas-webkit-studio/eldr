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

## Poučení z K01 (27.–30. 10. 2026)

- **Nejdřív ověř, pak piš Lukášovi.** Pošta, dashboard a živý web se kontrolují dřív, než mu zadáš úkol. Nezadávej mu, co je už hotové.
- **Ptej se a navrhuj, nerozhoduj za něj** (fakturace, rozsah, změny vzhledu). Nevymýšlej řešení, která nezadal (viditelný blok, podstránky).
- **Stručně.** Jedna zpráva: co je hotové, co zbývá, co musí udělat on. Bez esejí.
- **Co jde přes API, udělej sám.** Lukášovi jen to, co API neumí: prop „Link“ typu stránka na instancích komponent, Name u File Upload (API zapíše jen do schématu formuláře, HTML zůstane „File“), interakce, obrázky per locale.
- **Ověřuj na publikovaném HTML** (curl stagingu), ne v Designeru ani návratovým kódem.
- **Odkazy na stránku jdou za ID stránky.** Po přesunu staré stránky do `/dev/` vedou dlaždice dál na ni. Staré stránky mají v názvu „(old)“.
- **Zápis do produkčního Make** session udělá jen se souhlasem napsaným Lukášem pod jeho účtem v issue. Přeposlaný souhlas nebere.
- **Bundle jde z Cloudflare workeru `eldr-web`**, který se z repa nenasazuje. `CLAUDE.md` je od 31. 10. opravené. Cloudflare MCP worker vidí (seznam), ale kód nepřečte a nasadit neumí.
- Čti `standardy-stafeta` a drž hlavičku promptu; dotazy session se šetří posíláním do existující session (`send_message`), pokud má kontext pod ~300k.

## Poučení z K02 (noc 30.–31. 10. 2026)

- **Pětihodinový limit je společný pro celý účet.** Tři Opus session se subagenty ho vyčerpaly za dvě hodiny. Session po resetu **samy nepokračují**: koordinátor je musí probudit `send_message` („limit se obnovil, pokračuj, nejdřív zkontroluj, co už je hotové“). Budíky `send_later` po hodině jsou nutné, ale budík, který padne do limitu nebo restartu, se ztratí: proto jich naplánuj víc.
- **Hotovo session ověřuj sám na stagingu dřív, než pustíš další krok** (curl, JSON-LD, texty). Stačí vzorek, ale vlastní.
- **Nezávislá kontrola R2 se vyplatila.** Bez důvěry v hlášení autorů našla nepodložené tvrzení v meta Kariéry („průvodní dopis“) a nevhodná doporučení v dokumentech pro klienta. Kontrolor neopravuje, opravy jdou autorovi přes `send_message`.
- **Malé navazující opravy posílej autorovi, který má kontext** (`send_message`), ne nové session. S7 opravila meta za 3 minuty.
- **Rozšíření rozsahu zapiš do issue komentářem** dřív, než session spustíš. S7 dostala „část B“ (opravy textů z nálezů S6) a zvládla ji v jednom běhu.
- **Google Rich Results Test z cloudu nejde** (headless prohlížeč, tlačítko zůstane neaktivní). Validátor schema.org jde volat přímo (`POST validator.schema.org/validate`). Oficiální test Googlu dělá Lukáš ručně na vzorových stránkách.
- **Schema markup přes API:** jazyk bez vlastního zápisu zdědí češtinu, šablona CMS umí vazby na pole. Podrobnosti v `CLAUDE.md`, sekce Strukturovaná data.
- **Publikace:** `lastUpdated` bývá pár sekund po `lastPublished` (3–19 s) kvůli publikaci samotné. Když rozdíl nejde vysvětlit, podívej se do logu session (`list_events`), kdo zapisoval.
- **Texty EN/DE nespouštěj přes noc bez Lukáše,** pokud se kříží s rozpracovanou korekturou (`2474d5db`).

## Historie

- 2026-10-27 · K01 · založení štafetových dokumentů.
- 2026-10-30 · K01 · produkce publikovaná 22:56, předání novému koordinátorovi.
- 2026-10-31 · K02 · noční dodávka 3. 11.: S5, S6, S7, R2; produkce publikovaná 01:11:42.
