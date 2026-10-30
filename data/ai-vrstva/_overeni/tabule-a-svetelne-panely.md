# Ověření: tabule-a-svetelne-panely

- **Ověřeno:** 30. 10. 2026, 22:34 UTC, nezávislý ověřovatel (ne autor dat).
- **Stránka načtena znovu:** `node scripts/ai-vrstva/snapshot.js` pro cs, en, de. `diff` proti `_zdroj/tabule-a-svetelne-panely.<lang>.txt`: **beze změny ve všech třech jazycích**.
- **Surové HTML:** karty v přehledu odkazují na `#svetelne-panely`, `#intarzie`, `#reklamni-tabule`, `#menuboardy` (cs, en, de shodně), tedy na detailní sekce. Autor je správně sloučil do jednoho výrobku na sekci. Tlačítko „Jak probíhá výroba?“ vede na `#jak-probiha-vyroba` (společný blok průběhu zakázky).

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 72 | 69 | 6 | 0 | ✅ 69/69 (100 %) |
| en | 72 | 69 | 6 | 0 | ✅ 69/69 (100 %) |
| de | 72 | 69 | 6 | 0 | ✅ 69/69 (100 %) |

Klíče i pořadí výrobků jsou ve všech jazycích stejné: `svetelne-panely`, `intarzie`, `vystoupla-plexi-intarzie`, `podlozena-plexi-intarzie`, `reklamni-tabule`, `menuboardy`. EN a DE údaje jsou citace z EN a DE stránky, ne překlad z CS (ověřeno proti snímkům).

## Nálezy

1. **Vlastnosti stránky s vytrženými názvy** (`page.properties`, všechny jazyky). Názvy „velikosti“ / „sizes“ / „Größe“ a „Světelné panely vyrábíme“ / „We make illuminated panels“ / „Leuchtpaneele fertigen wir“ nejsou štítky, ale kusy věty z perexu. Druhá vlastnost („na míru vašim potřebám“) je obecný slib.
   → **Opraveno:** obě vlastnosti zrušeny, zapsáno do `vynechano`. Údaj o maximální velikosti („do velikosti 100 m²“ / „in sizes up to 100 m²“ / „bis zu einer Größe von 100 m²“) přesunut jako první provedení výrobku Světelné panely, protože věta mluví o světelných panelech. Perex zůstává jako popis stránky.
2. **Podtypy intarzie bez kotvy** (`vystoupla-plexi-intarzie`, `podlozena-plexi-intarzie`, `anchor: null`). Oba bloky leží v sekci `#intarzie` (outline).
   → **Opraveno:** `anchor` nastaven na `intarzie`, URL výrobku tedy ukazuje na sekci, kde je popsaný.
3. **Zkontrolováno a ponecháno:** všechny citace jsou na stránce doslova a jsou vidět. Grafika, materiál a umístění patří ke správným výrobkům ve všech jazycích. Hodnoty nemění smysl. DE u intarzie říká „wo nicht in die Fassade gebohrt werden darf“ (*nesmí*), kdežto CS „není možnost“. Je to ale citace z DE stránky, ne chyba vrstvy.
4. **Zkontrolováno a ponecháno: duplicity v provedení.** U Světelných panelů a Reklamní tabule se způsob grafiky objevuje jako vlastnost „Grafika“ i jako provedení. Nejde o nepodložený údaj, jen o opakování. Nechal jsem to tak kvůli konzistenci s ostatními stránkami (umístění je všude také vlastnost i použití).
5. **Chybějící údaje:** žádné. Snímek jsem prošel odshora: hero, 4 karty, 4 sekce se štítky a odrážkami Grafika/Materiál/Umístění a podsekce vystouplá/podložená intarzie jsou pokryté. Upoutávky karet, marketingové štítky a společné bloky o firmě jsou vědomě v `vynechano` s důvodem.

## Sporné, rozhodne člověk

- **Podtypy intarzie jako samostatné výrobky.** Vystouplá a podložená plexi intarzie jsou ve vrstvě jako samostatné výrobky a zároveň jako provedení „vystouplá, nebo podložená“ u výrobku Plexi intarzie. Fakticky je to v pořádku, každý má vlastní nadpis a popis. Jestli je ale chceme v JSON-LD jako samostatné `Product`, nebo jen jako provedení, je otázka struktury.
- **Blok „Jak probíhá výroba světelné reklamy?“** je doslova otázka a pod ní je odpověď. Autor ho do FAQ nedal, protože jde o společný blok všech produktových stránek s lhůtami („Do 2 pracovních dní“, „Do 4-8 týdnů“). S tím souhlasím, ale mělo by to platit jednotně pro všech 10 stránek.
- **Alt texty galerií jsou na /en a /de česky** („Světelný panel 1“ apod.). Obrázek výrobku je proto ve všech jazycích s českým alt. Je to vlastnost webu, opravit by se to dalo jen v Designeru.
- **Hero štítky** „Životnost desítky let“, „Odborná montáž“, „Kompletní servis“ jsou v `page.highlights`. Jde o tvrzení, ne parametry. README je ale v `highlights` výslovně připouští, proto zůstávají.
