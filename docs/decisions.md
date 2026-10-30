# Rozhodnutí

Rozhodnutí, která padla během štafety a nejsou v `CLAUDE.md`. Nejnovější
nahoře. Formát: datum · kdo · rozhodnutí · proč · odkaz.

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
