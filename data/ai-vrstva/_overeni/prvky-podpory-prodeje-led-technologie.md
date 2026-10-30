# Ověření: prvky-podpory-prodeje-led-technologie

**Ověřeno:** 30. 10. 2026, 22:33 UTC, nezávislý ověřovatel (ne autor dat).

**Stránka načtena znovu:** `node scripts/ai-vrstva/snapshot.js --out …/scratchpad/overeni/<slug> <slug>` pro cs, en, de. `diff` proti `_zdroj/<slug>.<lang>.txt`: **beze změny ve všech třech jazycích**. Navíc staženo surové HTML všech tří locale (`curl`).

## Přehled

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 34 | 32 | 4 | 0 | ✅ 32/32 (100 %) |
| en | 34 | 32 | 4 | 0 | ✅ 32/32 (100 %) |
| de | 34 | 32 | 4 | 0 | ✅ 32/32 (100 %) |

Klíče a pořadí výrobků (`prvky-podpory-prodeje`, `led-displaye`, `segmentove-displeje`, `maticove-displeje`) jsou stejné ve všech jazycích; EN/DE citace jsou z EN/DE stránky.

## Ověřené předpoklady

- Karty rozcestníku odkazují `href="#prvky-podpory-prodeje"` a `#led-displaye`; sekce mají `<h2>` shodné s názvem karty → sloučení karta + sekce je doložené.
- Obrázky výrobků odpovídají outline daného locale.
- FAQ: žádná otázka o výrobcích. DE nadpis „Warum ist unsere Leuchtreklame die richtige Wahl?“ je společný blok o firmě → správně ve `vynechano`.

## Nálezy

1. **Vlastnost „Označují se zkratkami“ = „POP (point of purchase) a POS (point of sale)“** (EN „They are known by the abbreviations“, DE „Bezeichnet werden sie mit den Abkürzungen“) — stránka žádný takový štítek nemá, název vytržen z věty. → **Opraveno:** vlastnost zrušena, celá věta přesunuta do `variants`.
2. **Vlastnost „Ovládají se“ = „dálkovým ovladačem, aplikací nebo přes datovou síť“** u LED displejů (EN „They are controlled by“, DE „Gesteuert werden sie“) — totéž. → **Opraveno:** vlastnost zrušena, věta „Ovládají se dálkovým ovladačem, aplikací nebo přes datovou síť.“ v `variants`.
3. **Prvky podpory prodeje, „Zpracování“ obsahovalo „Stačí se jen domluvit a my vám vyrobíme reklamní prvky podporující váš prodej na míru.“** a z věty byla navíc odvozená varianta „my vám vyrobíme … na míru“ — slib služby, ne vlastnost výrobku. → **Opraveno:** hodnota zkrácena na první větu, varianta vyhozena, obojí do `vynechano` (že jde o výrobu na míru, říká už popis z karty). Totéž EN („Just tell us…“), DE („Sagen Sie uns…“).
4. **Štítek „Interiér i exteriér“ chyběl u LED displejů**, ačkoli ho v HTML má i sekce `#led-displaye` (ve snímku jednou kvůli deduplikaci). → **Opraveno:** přidán do `uses` ve všech jazycích.

Ponecháno po kontrole:
- „Umíme zhotovit“ / „What we make“ / „Das fertigen wir“ — na stránce je to tučný štítek bodu, tedy legitimní název vlastnosti.
- Segmentové a maticové displeje jako samostatné výrobky bez kotvy (`anchor: null`): na stránce nemají vlastní sekci, jsou to dva typy v rámci LED displejů („…dvou typů displejů:“). Údaje sedí a jsou správně přiřazené; zároveň jsou jmenovány ve `variants` LED displejů. Ponecháno, viz níže.

## K rozhodnutí člověkem

- **Segmentové/maticové displeje: samostatné výrobky, nebo jen typy LED displejů?** Data jsou správná, jde o modelování. Jako samostatné výrobky se v JSON-LD objeví jako dvě další položky nabídky, přestože stránka je uvádí jako typy jednoho výrobku.
- **Štítek „Interiér i exteriér“ u prvků podpory prodeje vs. věta „se umisťují do obchodních prostor“.** Štítek je na všech sekcích stejný a vypadá jako hodnota ze šablony. Vrstva ho přebírá, protože je vidět; pokud neplatí, opravit ve Webflow.
- **Alt texty obrázků jsou na /en a /de česky** — překlad altů je práce ve Webflow Designeru.
