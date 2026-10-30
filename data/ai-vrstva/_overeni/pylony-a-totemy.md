# Ověření: pylony-a-totemy

- **Ověřeno:** 30. 10. 2026, 22:34 UTC. Stránka byla znovu načtena
  (`snapshot.js --out …/overeni/pylony-a-totemy`) ve všech třech jazycích.
- **Diff proti snímku autora** (`_zdroj/pylony-a-totemy.{cs,en,de}.txt`): **beze změny**
  ve všech třech jazycích.
- **Surové HTML:** karty v rozcestníku odkazují na `href="#pylony"` a
  `href="#totemy"` (cs, en, de). Autor je správně vedl jako dva výrobky
  s kotvou sekce, duplicita tu není.

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 44 | 43 | 2 (pylony, totemy) | 0 | ✅ 43/43 |
| en | 44 | 43 | 2 (pylony, totemy) | 0 | ✅ 43/43 |
| de | 44 | 43 | 2 (pylony, totemy) | 0 | ✅ 43/43 |

Klíče a pořadí výrobků jsou ve všech jazycích stejné. EN a DE citace jsou
z EN a DE stránky, ne překlad z češtiny.

## Nálezy

1. **Vlastnost stránky s názvem z úlomku věty** – „Možnosti provedení totemů
   a pylonů“ / „The design possibilities for totems and pylons“ / „Die
   Gestaltungsmöglichkeiten für Totems und Pylone“ → hodnota „Vyrábíme je
   individuálně, přesně dle zákazníkova přání.“ Název není štítek (je to
   začátek věty „… jsou téměř neomezené“, tedy marketingového tvrzení).
   → **Opraveno:** vlastnost zrušena, věta o individuální výrobě přesunuta do
   `variants` obou výrobků (generátor ji označí „Provedení“), záznam ve
   `vynechano`.
2. **Duplicitní a kostrbaté použití u totemů** – „umožňují umístit reklamu
   na místa s potřebou označení a navigace“ (EN „allow the placement of
   promotions…“, DE „ermöglicht es, Werbung…“) je úlomek začínající slovesem
   a opakuje „Umístění: … tam, kde je potřeba označení a navigace“.
   → **Vyhozeno** do `vynechano`.
3. Ostatní údaje prošly: citace doslovně na stránce, Grafika / Materiál /
   Umístění sedí ke svým výrobkům (kotvy `pylony` a `totemy` podle outline),
   tvrzení o firmě (rekord Hyundai 37 m, „stovky realizací“) už autor
   správně vyřadil. Nic podstatného nechybí.

## Sporné – rozhodne člověk

- **EN vlastnost stránky „height“** (z věty „…with advertising towers ranging
  in height from 1 to 40 metres“) je jedno slovo s malým písmenem. Význam
  sedí a stejný údaj je v CS/DE pod štítkem „Výška reklamních věží“ / „Die
  Höhe der Werbetürme“, proto ponecháno.
- **„Výroba reklamních pylonů a totemů od A do Z“** je jako název vlastnosti
  použitý nadpis sekce, hodnota popisuje služby (projekt, statika, světelné
  studie, simulace výšky vysokozdvižnou technikou). Konkrétní a doložené,
  ponecháno – ale je to spíš popis služby než parametr výrobku.
- **Štítek „360 ° viditelnost“** u pylonů je vyřazen jako marketingový.
  Dá se číst i jako vlastnost (koruna trojúhelníková/čtvercová), ale stránka
  ho ničím nedokládá.
- **Text webu:** popis karty Pylony „Nepřehlédnutelný i z velké dálky,
  a proto velmi účinný.“ – jednotné číslo u „Reklamy …“ (asi má být
  „Nepřehlédnutelné … účinné“). Citováno doslova; oprava patří do Webflow.
- **Alt obrázků** na EN a DE stránce je česky („Světelný pylon 1“) –
  Webflow alt obrázků v sekundárním locale přes API nezapíše (viz CLAUDE.md).
