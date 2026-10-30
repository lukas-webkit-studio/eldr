# Ověření: designova-a-interierova-svitidla-specialni-projekty

- **Ověřeno:** 30. 10. 2026, 22:34 UTC, nezávislý ověřovatel (ne autor dat).
- **Stránka načtena znovu:** `node scripts/ai-vrstva/snapshot.js` pro cs, en, de. `diff` proti `_zdroj/designova-a-interierova-svitidla-specialni-projekty.<lang>.txt`: **beze změny ve všech třech jazycích**.
- **Surové HTML:** karty v přehledu odkazují na `#designova-svitidla`, `#zarovkove-svetelne-napisy`, `#neonove-napisy`, `#mechove-steny`, `#reklama-z-cortenoveho-plechu`, `#svetelna-cisla-domu`, `#stojaci-lampy` (cs, en, de shodně). Autor správně sloučil kartu a sekci do jednoho výrobku. Pod H1 není v HTML žádný perex, jen štítky.

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 90 | 87 | 7 | 2 | ✅ 87/87 (100 %) |
| en | 90 | 87 | 7 | 2 | ✅ 87/87 (100 %) |
| de | 90 | 87 | 7 | 2 | ✅ 87/87 (100 %) |

Klíče a pořadí výrobků jsou ve všech jazycích stejné: `designova-svitidla`, `zarovkove-svetelne-napisy`, `neonove-napisy`, `mechove-steny`, `reklama-z-cortenoveho-plechu`, `svetelna-cisla-domu`, `stojaci-lampy`. EN a DE údaje jsou citace z EN a DE stránky.

## Nálezy

1. **Popis stránky je navigační věta.** `page.description` = „Podívejte se blíže na to, co vás zajímá. Pamatujte, všechno jde uzpůsobit:“ (EN/DE obdobně). Není to perex a na stránce Tabule je táž věta vyřazená jako navigační.
   → **Opraveno:** `page.description: null` (stejně jako u jiných stránek bez perexu), zapsáno do `vynechano`.
2. **Slepená vlastnost stránky.** `page.properties` = „Na míru“ → „všechno jde uzpůsobit“. Název pochází ze štítku v hero, hodnota z navigační věty, na stránce spolu nesouvisí.
   → **Vyhozeno**, zapsáno do `vynechano`.
3. **Tvrzení o firmě v popisu výrobku** (Designová svítidla): „Díky mnohaletým zkušenostem …“ / „Years of experience mean …“ / „Dank langjähriger Erfahrung …“.
   → **Opraveno:** popis zkrácen na část o výrobě na míru („vám na míru zhotovíme jakékoliv designové svítidlo.“), úvod zapsán do `vynechano`.
4. **Marketingová upoutávka jako popis výrobku** (Žárovkové světelné nápisy): „Pokud toužíte po retro nádechu … Las Vegas“. Nic neříká o výrobku a v CS je to navíc nedokončená věta bez tečky.
   → **Opraveno:** popisem je věta o konstrukci ze sekce („žárovkový světelný nápis tvoří plechový korpus, v němž jsou umístěny žárovičky.“). Upoutávka je ve `vynechano`.
5. **Materiály jako celé věty** (Žárovkové nápisy). „žárovkový světelný nápis tvoří plechový korpus…“ a „používáme vysoce úsporné LED žárovky s možností…“ nebyly materiály, ale věty.
   → **Opraveno:** zúženo na „plechový korpus“ a „vysoce úsporné LED žárovky“ (EN „a sheet-metal body“, „highly efficient LED bulbs“; DE „Blechkorpus“, „hocheffiziente LED-Lampen“).
6. **Materiál jako postup** (Neonové nápisy): „plexisklo ohýbáme do zvoleného tvaru a prosvítíme…“.
   → **Opraveno:** zúženo na „plexisklo“ / „acrylic glass“ / „Plexiglas“.
7. **Marketingová věta v umístění** (Neonové nápisy): „Výsledkem je světelný prvek, který zaujme svou estetikou i řemeslným zpracováním.“
   → **Opraveno:** hodnota zkrácena na první větu („Jsou ideální tam, kde je cílem originalita, styl a skutečný neonový dojem.“), druhá věta je ve `vynechano`.
8. **Hodnotící obrat ve vlastnosti** (Mechové stěny): „vypadají skvěle a mají praktické výhody.“
   → **Opraveno:** hodnota začíná konkrétními výhodami („Jsou ekologické, snadno se udržují … akustiku místnosti a čistit vzduch.“). Název vlastnosti „Proč mechové stěny“ / „Why a moss wall“ / „Warum eine Mooswand“ je štítek přímo ze stránky (text před dvojtečkou), proto zůstává.
9. **Zkontrolováno a ponecháno:** FAQ. Obě otázky („Jak fungují tradiční neonové nápisy?“, „Proč raději doporučujeme imitaci neonových nápisů?“) jsou na stránce doslova jako nadpisy h3 a hned za nimi je odpověď, ve všech jazycích. Druhá odpověď obsahuje srovnání ceny („za podstatně nižší cenu“). Je to ale tvrzení o výrobku, ne o firmě, takže zůstává.
10. **Chybějící údaje:** žádné. Snímek jsem prošel odshora: 7 karet, 7 sekcí s odrážkami, FAQ neonů a štítky sekcí (Interiér, Interiér a exteriér, …) převzaté jako použití jsou pokryté.

## Sporné, rozhodne člověk

- **H1 neodpovídá obsahu stránky.** H1 zní „Neonová a LED neonová designová svítidla“ (EN „Neon and LED neon designer lights“, DE „Design-Leuchten aus Neon und LED-Neon“), ale stránka (slug `designova-a-interierova-svitidla-specialni-projekty`) nabízí i mechové stěny, corten, čísla domů a stojací lampy. Vypadá to na nedotažené přejmenování ve Webflow. Vrstva H1 cituje věrně jako `page.name`, takže stejný nesoulad přebírá i JSON-LD (název služby i katalogu).
- **`{#YOE#}` ve viditelném textu bez JS.** Hero štítek „{#YOE#} let zkušeností“ vidí robot bez JS jako surový token, číslo doplní až `10-vars.js`. Pro AI crawlery bez JS je to viditelná chyba na webu, ne ve vrstvě. Ve vrstvě je štítek správně vynechaný.
- **Karta „Neonové nápisy & imitace“ si odporuje se sekcí.** Karta tvrdí „Tento typ světelné reklamy tvoří plastové pásky různých barev“, sekce ale popisuje skleněné neonové trubice a imitaci z ohýbaného plexiskla. Ve vrstvě zůstává text karty jako popis výrobku a plastové pásky jako jeden z materiálů, protože je to doslova na stránce. AI z toho ale může vyvodit, že neonové nápisy jsou z plastu. Doporučuji upravit text karty ve Webflow, nebo popis ve vrstvě nahradit.
- **Popis Světelných čísel domů** („Přidejte svému obydlí výjimečnosti a zkrášlete jeho exteriér…“) je napsaný jako výzva. Ponechán, protože nese věcný údaj (světelné či nesvětelné číslo) a jiný popis sekce nemá.
- **Alt texty galerií jsou na /en a /de česky.** Hlavní obrázky výrobků mají popisný alt, ale česky ve všech jazycích.
