# Ověření: architektonicke-prvky-vstupni-portaly-vlajky

**Ověřeno:** 30. 10. 2026, 22:33 UTC, nezávislý ověřovatel (ne autor dat).

**Stránka načtena znovu:** `node scripts/ai-vrstva/snapshot.js --out …/scratchpad/overeni/<slug> <slug>` pro cs, en, de. `diff` proti `_zdroj/<slug>.<lang>.txt`: **beze změny ve všech třech jazycích**. Navíc staženo surové HTML všech tří locale (`curl`) kvůli kotvám a skrytým prvkům.

## Přehled

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 45 | 46 | 3 | 0 | ✅ 46/46 (100 %) |
| en | 45 | 46 | 3 | 0 | ✅ 46/46 (100 %) |
| de | 45 | 46 | 3 | 0 | ✅ 46/46 (100 %) |

Klíče a pořadí výrobků (`vstupni-portaly`, `architektonicke-prvky`, `vlajky`) jsou stejné ve všech jazycích. EN a DE citace pocházejí z EN/DE stránky, ne z překladu češtiny (test je dohledal ve snímcích daných locale).

## Ověřené předpoklady

- **Sloučení karet se sekcemi je doložené:** v HTML karty rozcestníku odkazují `href="#vstupni-portaly"`, `#architektonicke-prvky`, `#vlajky` a sekce s těmito `id` mají `<h2>` totožné s názvem karty (CS i EN/DE). Snímek nadpisy sekcí neukazuje jen proto, že `snapshot.js` deduplikuje opakovaný text.
- **Obrázky** sedí na outline daného locale (EN má u dvou výrobků jinou velikost souboru než CS/DE, `…_vstupni-portaly.jpg` a `…_vlajky.jpg` — odpovídá stránce).
- FAQ: na stránce není žádný nadpis‑otázka s odpovědí o výrobcích; „Jak probíhá výroba…?“ je společný blok procesu → správně ve `vynechano`.

## Nálezy

1. **Štítek „Interiér i exteriér“ / „Indoors and outdoors“ / „Innen und außen“ byl jen u vstupních portálů.** Surové HTML ukazuje, že ho mají v `product_metatag-list` všechny tři sekce (ve snímku je jednou kvůli deduplikaci). → **Opraveno:** přidán do `uses` u `architektonicke-prvky` a `vlajky` ve všech jazycích.
2. **`page.description` = „Pamatujte, všechno jde uzpůsobit“** — obecná výzva nad kartami rozcestníku, ne perex ani popis výrobků. Na sesterské stránce `prvky-podpory-prodeje-led-technologie` je stejná věta autorem správně vyhozena (`description = null`). → **Vyhozeno** (null), zapsáno do `vynechano`.
3. **Vstupní portály, vlastnost „Zpracování“, obsahovala „Náš tým vytvoří individuální návrh s ohledem na možnosti budovy.“** — tvrzení o službě firmy, ne vlastnost výrobku. → **Opraveno:** hodnota zkrácena na první dvě věty (citace zůstává celá), věta do `vynechano`. Totéž EN („Our team…“), DE („Unser Team…“).
4. **Architektonické prvky, vlastnost „Zpracování“, obsahovala „Výsledkem je čisté řešení s vysokou funkčností a dlouhou životností.“** — marketingový slib výsledku. → **Opraveno:** hodnota zkrácena, věta do `vynechano`. Totéž EN („The result is…“), DE („Das Ergebnis ist…“).

Ponecháno po kontrole:
- Popis `architektonicke-prvky` je úsek „světelné linky na fasádě budov, osvětlení fasád, dynamickou reklamu a fasádní pásy“ z věty „Jsme specialisté na…“ — jiný popis výrobku stránka nenabízí (karta i zbytek sekce jsou tvrzení o firmě). Úsek je věcný výčet, ne tvrzení „jsme specialisté“.
- „Kvalitní LED moduly s vysokou IP ochranou… dlouhou životnost“ a „Vlajky jsou vyráběny z kvalitních materiálů…“ — obecné, ale jde o vlastnosti výrobku, ne o firmě.
- „Díky pohybu ve větru mohou vlajky přitahovat ještě větší pozornost…“ v hodnotě „Umístění“ — tvrzení o výrobku, ne o firmě; ponecháno.

## K rozhodnutí člověkem

- **Štítky sekcí „Interiér i exteriér“ a „Na míru“ jsou na všech třech sekcích totožné** (i na stránce prvků podpory prodeje). Vypadá to jako hodnota převzatá ze šablony sekce, ne jako vědomě zadaný údaj. Na webu je ale vidět, takže je ve vrstvě. Pokud např. reklamní vlajky nebo fasádní prvky do interiéru nedodáváte, je potřeba opravit štítek ve Webflow (a pak vrstvu).
- **Alt texty obrázků výrobků jsou i na /en a /de česky** („Zelený prosvětlený vstupní portál budovy“…). Vrstva přebírá, co na stránce je; překlad altů je práce ve Webflow Designeru.
